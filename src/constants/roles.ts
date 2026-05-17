export const Roles = {
  SYNDIC: 'syndic' as const,
  RESIDENT: 'resident' as const,
  GATEKEEPER: 'gatekeeper' as const,
};

export const RoleLabels: Record<string, string> = {
  syndic: 'Síndico',
  resident: 'Morador',
  gatekeeper: 'Porteiro',
};

export const PriorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const ReservationStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  cancelled: 'Cancelada',
};

export const VisitorStatusLabels: Record<string, string> = {
  pending: 'Aguardando',
  checked_in: 'No condomínio',
  checked_out: 'Saiu',
  denied: 'Negado',
};

export const VotingStatusLabels: Record<string, string> = {
  open: 'Aberta',
  closed: 'Encerrada',
};

export const ResidentTypeLabels: Record<string, string> = {
  owner: 'Proprietário',
  tenant: 'Inquilino',
};

export const VisitorTypeLabels: Record<string, string> = {
  family: 'Familiar',
  service: 'Prestador de serviço',
  delivery: 'Entregador',
  common: 'Visitante comum',
};

export const UserStatusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export const ApartmentTypeLabels: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  penthouse: 'Cobertura',
  commercial: 'Sala Comercial',
};

export const ApartmentStatusLabels: Record<string, string> = {
  available: 'Disponível',
  occupied: 'Ocupado',
  inactive: 'Inativo',
};
