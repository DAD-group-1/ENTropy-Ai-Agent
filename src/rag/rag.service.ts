// rag/rag.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';
import { ConfigService } from '@nestjs/config';
import { PERMISSION_DOCS } from './permissions.docs';

interface EmbeddedDoc {
  id: string;
  roles: string[];
  content: string;
  embedding: number[];
}

@Injectable()
export class RagService implements OnModuleInit {
  private readonly logger = new Logger(RagService.name);
  private readonly ollama: Ollama;
  private readonly embedModel = 'nomic-embed-text';
  private store: EmbeddedDoc[] = [];

  constructor(private readonly configService: ConfigService) {
    this.ollama = new Ollama({
      host: this.configService.get<string>(
        'OLLAMA_HOST',
        'http://localhost:11434',
      ),
    });
  }

  async onModuleInit() {
    this.logger.log('Embedding permission docs...');

    for (const doc of PERMISSION_DOCS) {
      const embedding = await this.embed(doc.content);
      this.store.push({ ...doc, embedding });
    }

    this.logger.log(`${this.store.length} docs embedded and ready`);
  }

  async retrieve(query: string, userRole: string, topK = 2): Promise<string[]> {
    const queryEmbedding = await this.embed(query);

    return this.store
      .filter((doc) => doc.roles.includes(userRole.toLowerCase()))
      .map((doc) => ({
        content: doc.content,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter((result) => result.score > 0.5) // relevance threshold
      .map((result) => result.content);
  }

  private async embed(text: string): Promise<number[]> {
    const response = await this.ollama.embed({
      model: this.embedModel,
      input: text,
    });
    return response.embeddings[0];
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
}
