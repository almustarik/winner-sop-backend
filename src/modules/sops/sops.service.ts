import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSopDto, UpdateSopDto, AIGenerationRequest } from './dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SopsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSopDto) {
    const content = { introduction: '', academic_background: '', work_experience: '', achievements: '', career_goals: '', motivation: '', conclusion: '' };
    const feedback = { clarity: 8.0, goal_alignment: 8.0, personal_story: 7.0, language: 8.0, overall: 7.8, suggestions: [] };
    const plagiarism = { score: 5.0, is_original: true, sources: [] };
    const user = await this.prisma.user.findFirst();
    const sop = await this.prisma.sOP.create({ data: {
      userId: user?.id ?? 'seed-user',
      title: dto.title,
      type: dto.type as any,
      targetProgram: dto.target_program,
      targetUniversity: dto.target_university,
      tone: (dto.tone ?? 'formal') as any,
      content, feedback, plagiarism,
      wordCount: 0, readingTime: 0,
    }});
    await this.prisma.sOPVersion.create({ data: { sopId: sop.id, version: 1, content, feedback, changes: ['Initial draft'] } });
    return sop;
  }

  async list(page: number, limit: number) {
    const user = await this.prisma.user.findFirst();
    const where = { userId: user?.id ?? 'seed-user' } as any;
    const [total, sops] = await this.prisma.$transaction([
      this.prisma.sOP.count({ where }),
      this.prisma.sOP.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit })
    ]);
    return { sops, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async get(id: string) {
    const sop = await this.prisma.sOP.findUnique({ where: { id } });
    if (!sop) throw new NotFoundException('SOP not found');
    return sop;
  }

  async update(id: string, dto: UpdateSopDto) {
    const sop = await this.get(id);
    await this.prisma.sOPVersion.create({ data: { sopId: sop.id, version: sop.version, content: sop.content, feedback: sop.feedback, changes: ['Manual edit'] } });
    return this.prisma.sOP.update({ where: { id }, data: {
      title: dto.title ?? undefined,
      targetProgram: dto.target_program ?? undefined,
      targetUniversity: dto.target_university ?? undefined,
      tone: (dto.tone as any) ?? undefined,
      version: { increment: 1 },
      updatedAt: new Date(),
    }});
  }

  async remove(id: string) {
    await this.prisma.sOP.delete({ where: { id } });
    return { deleted: true };
  }

  async generate(dto: AIGenerationRequest) {
    const content = { introduction: '...', academic_background: '...', work_experience: '...', achievements: '...', career_goals: '...', motivation: '...', conclusion: '...' };
    const feedback = { clarity: 8.0, goal_alignment: 8.0, personal_story: 7.0, language: 8.0, overall: 7.8, suggestions: [] };
    return { content, feedback, processing_time: 0.1, model_used: 'stub' };
  }

  async feedback(id: string) { return { feedback: { clarity: 8, goalAlignment: 8, language: 8, personalStory: 7, overall: 8 } }; }
  async plagiarism(id: string) { return { plagiarism: { score: 5.0, isOriginal: true, sources: [] } }; }
  async improve(id: string) { return { id, improved: true }; }
  async export(id: string, format: string) { return { filename: `sop-${id}.${format}`, url: `/download/${id}.${format}` }; }
  async versions(id: string) { return this.prisma.sOPVersion.findMany({ where: { sopId: id }, orderBy: { version: 'desc' } }); }
  async restore(id: string, version: number) {
    const v = await this.prisma.sOPVersion.findFirst({ where: { sopId: id, version } });
    if (!v) throw new NotFoundException('Version not found');
    await this.prisma.sOPVersion.create({ data: { sopId: id, version: version + 1, content: v.content, feedback: v.feedback, changes: ['Restore to previous version'] } });
    return this.prisma.sOP.update({ where: { id }, data: { content: v.content, feedback: v.feedback, version: { increment: 1 }, updatedAt: new Date() } });
  }
}
