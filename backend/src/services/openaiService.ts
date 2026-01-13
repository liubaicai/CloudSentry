import OpenAI from 'openai';
import prisma from '../config/database';
import { logger } from '../utils/logger';

interface FieldMappingSuggestion {
  sourceField: string;
  targetField: string;
  transformType: string;
  transformConfig?: any;
  description: string;
}

export class OpenAIService {
  private openai: OpenAI | null = null;
  private config: any = null;

  async initialize(): Promise<void> {
    try {
      // Get the first enabled OpenAI config
      const config = await prisma.openAIConfig.findFirst({
        where: { enabled: true },
      });

      if (!config) {
        logger.warn('No enabled OpenAI config found');
        return;
      }

      this.config = config;
      this.openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });

      logger.info('OpenAI service initialized');
    } catch (error) {
      logger.error('Failed to initialize OpenAI service:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config) {
      await this.initialize();
    }
    return this.openai !== null && this.config !== null;
  }

  async generateFieldMappings(
    sampleData: any,
    sourceIdentifier: string
  ): Promise<FieldMappingSuggestion[]> {
    if (!await this.isAvailable()) {
      throw new Error('OpenAI service is not available');
    }

    try {
      // Define the target schema
      const targetSchema = {
        threatName: 'Name of the threat/alert (string)',
        threatLevel: 'Threat level: critical, high, medium, low, info (string)',
        severity: 'Severity level: critical, high, medium, low, info (string)',
        category: 'Category: malware, intrusion, policy_violation, etc. (string)',
        sourceIp: 'Source IP address (string, required)',
        destinationIp: 'Destination IP address (string, optional)',
        sourcePort: 'Source port number (integer, optional)',
        destinationPort: 'Destination port number (integer, optional)',
        protocol: 'Network protocol like TCP, UDP, ICMP, etc. (string, optional)',
        message: 'Human-readable message or description (string)',
        tags: 'Array of tags for categorization (string array, optional)',
        metadata: 'Additional structured data (JSON object, optional)',
      };

      const prompt = `You are a security event field mapping expert. Given the following sample security event data from source "${sourceIdentifier}", generate field mappings to the target schema.

Sample Data:
${JSON.stringify(sampleData, null, 2)}

Target Schema Fields:
${JSON.stringify(targetSchema, null, 2)}

Instructions:
1. Analyze the sample data structure and identify which fields map to the target schema
2. For each mapping, suggest:
   - sourceField: the field name in the sample data
   - targetField: the field name in the target schema (must be one of: threatName, threatLevel, severity, category, sourceIp, destinationIp, sourcePort, destinationPort, protocol, message, tags, metadata)
   - transformType: "direct" for simple copy, "regex" for pattern extraction, "lookup" for value mapping
   - transformConfig: configuration for transformation (e.g., regex pattern, lookup table)
   - description: brief description of the mapping

3. Prioritize mapping the required fields: sourceIp, severity, category, message
4. Look for common patterns in field names (e.g., src_ip, source_ip, sip all likely map to sourceIp)
5. Infer severity/threat level from keywords if not explicitly present
6. Return ONLY a valid JSON array of mappings, no additional text

Example output format:
[
  {
    "sourceField": "src_ip",
    "targetField": "sourceIp",
    "transformType": "direct",
    "description": "Map source IP directly"
  },
  {
    "sourceField": "alert_level",
    "targetField": "severity",
    "transformType": "lookup",
    "transformConfig": {"mappings": {"1": "low", "2": "medium", "3": "high", "4": "critical"}},
    "description": "Map numeric alert level to severity"
  }
]`;

      const response = await this.openai!.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a security event field mapping expert. You analyze security log data and generate accurate field mappings. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response
      let mappings: FieldMappingSuggestion[];
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : content;
        mappings = JSON.parse(jsonStr.trim());
      } catch (parseError) {
        logger.error('Failed to parse OpenAI response:', content);
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      if (!Array.isArray(mappings)) {
        throw new Error('OpenAI response is not an array');
      }

      logger.info(`Generated ${mappings.length} field mappings using AI`);
      return mappings;
    } catch (error) {
      logger.error('Failed to generate field mappings:', error);
      throw error;
    }
  }

  async findCompatibleMapping(
    sampleData: any,
    sourceIdentifier: string
  ): Promise<any | null> {
    try {
      // Look for existing AI-generated mappings with similar patterns
      const existingMappings = await prisma.aIGeneratedMapping.findMany({
        where: {
          tested: true,
          successCount: { gt: 0 },
        },
        orderBy: [
          { successCount: 'desc' },
          { lastUsedAt: 'desc' },
        ],
      });

      // Try to find a compatible mapping by checking if the sample data has similar structure
      for (const mapping of existingMappings) {
        const sampleKeys = Object.keys(sampleData);
        const mappingKeys = Object.keys(mapping.sampleData as any);

        // Calculate similarity (simple key overlap check)
        const commonKeys = sampleKeys.filter(key => mappingKeys.includes(key));
        const similarity = commonKeys.length / Math.max(sampleKeys.length, mappingKeys.length);

        // If more than 70% of keys match, consider it compatible
        if (similarity > 0.7) {
          logger.info(`Found compatible mapping with ${(similarity * 100).toFixed(0)}% similarity`);
          
          // Update usage stats
          await prisma.aIGeneratedMapping.update({
            where: { id: mapping.id },
            data: {
              lastUsedAt: new Date(),
              successCount: { increment: 1 },
            },
          });

          return mapping.generatedMappings;
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to find compatible mapping:', error);
      return null;
    }
  }

  async saveGeneratedMapping(
    sourceIdentifier: string,
    sampleData: any,
    mappings: FieldMappingSuggestion[]
  ): Promise<void> {
    try {
      await prisma.aIGeneratedMapping.create({
        data: {
          channelPattern: sourceIdentifier,
          sampleData: sampleData as any,
          generatedMappings: mappings as any,
          tested: false,
        },
      });

      logger.info(`Saved AI-generated mapping for ${sourceIdentifier}`);
    } catch (error) {
      logger.error('Failed to save generated mapping:', error);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();
