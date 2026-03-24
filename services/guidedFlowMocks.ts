import type { GuidedRoleMatch, GuidedTranslationResult } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const MOCK_ROLE_MATCHES: GuidedRoleMatch[] = [
  {
    id: 'operations-coordinator',
    title: 'Operations Coordinator',
    summary: 'Keeps people, tasks, and handoffs organized during busy day-to-day work.',
    focusArea: 'Coordination and execution',
  },
  {
    id: 'logistics-specialist',
    title: 'Logistics Specialist',
    summary: 'Supports equipment, supplies, and process follow-through across moving parts.',
    focusArea: 'Logistics and support',
  },
  {
    id: 'team-supervisor',
    title: 'Team Supervisor',
    summary: 'Leads small teams, sets direction, and keeps work on track under pressure.',
    focusArea: 'Team leadership',
  },
];

export const MOCK_TRANSLATIONS_BY_ROLE: Record<string, GuidedTranslationResult> = {
  'operations-coordinator': {
    targetRoleTitle: 'Operations Coordinator',
    translatedBullet:
      'Coordinated daily team activities, tracked task completion, and kept operations moving in a structured, fast-paced environment.',
    explanation:
      'This mock translation shifts the focus toward coordination, follow-through, and reliability for civilian operations work.',
  },
  'logistics-specialist': {
    targetRoleTitle: 'Logistics Specialist',
    translatedBullet:
      'Supported operational readiness by organizing resources, maintaining accountability, and helping teams stay equipped for assigned work.',
    explanation:
      'This mock translation frames the experience around logistics support, resource handling, and operational consistency.',
  },
  'team-supervisor': {
    targetRoleTitle: 'Team Supervisor',
    translatedBullet:
      'Led day-to-day team execution, reinforced standards, and helped teammates complete work effectively in a high-responsibility setting.',
    explanation:
      'This mock translation emphasizes people leadership, accountability, and steady execution instead of military-specific wording.',
  },
};

export const findMockRoleMatches = async (_inputText: string): Promise<GuidedRoleMatch[]> => {
  await delay(450);
  return MOCK_ROLE_MATCHES;
};

export const generateMockTranslation = async (
  role: GuidedRoleMatch,
  _inputText: string,
): Promise<GuidedTranslationResult> => {
  await delay(450);

  return (
    MOCK_TRANSLATIONS_BY_ROLE[role.id] ?? {
      targetRoleTitle: role.title,
      translatedBullet:
        'Translated civilian-ready bullet will appear here once a matching template is added.',
      explanation: 'This is a fallback mock response for roles without a dedicated fake translation yet.',
    }
  );
};
