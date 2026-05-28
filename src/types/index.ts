// ─── User Roles ─────────────────────────────────────────────────────────────
export type UserRole = 'syndic' | 'resident' | 'gatekeeper';

// ─── User Status ────────────────────────────────────────────────────────────
export type UserStatus = 'active' | 'inactive';

// ─── Resident Type ──────────────────────────────────────────────────────────
export type ResidentType = 'owner' | 'tenant';

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  name: string;
  cpf: string;
  rg: string;
  email: string;
  role: UserRole;
  residentType?: ResidentType;
  birthDate?: string;           // YYYY-MM-DD
  apartmentId?: string;         // Referência ao apartamento
  apartment?: string;           // Legado/Cache
  block?: string;               // Legado/Cache
  phone?: string;
  photoURL?: string;
  status: UserStatus;
  condominiumId?: string;
  pushToken?: string;
  createdAt: number;
}

// ─── Structure (Blocks & Apartments) ─────────────────────────────────────────
export interface Block {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export type ApartmentType = 'apartment' | 'house' | 'penthouse' | 'commercial';
export type ApartmentStatus = 'available' | 'occupied' | 'inactive';

export interface Apartment {
  id: string;
  number: string;
  blockId?: string;
  blockName?: string; // Cache
  type: ApartmentType;
  status: ApartmentStatus;
  floor?: string;
  observations?: string;
  createdAt: number;
}

// ─── Notice ──────────────────────────────────────────────────────────────────
export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: NoticePriority;
  authorId: string;
  authorName?: string;
  createdAt: number;
  updatedAt: number;
}

// ─── Event ───────────────────────────────────────────────────────────────────
export interface CondominiumEvent {
  id: string;
  title: string;
  description: string;
  date: number;
  location: string;
  createdAt: number;
  updatedAt?: number;
  authorId: string;
  authorName?: string;
}

// ─── Space ───────────────────────────────────────────────────────────────────
export interface Space {
  id: string;
  name: string;
  description: string;
  capacity: number;
  rules: string;
  imageURL?: string;
  active: boolean;
}

// ─── Reservation ─────────────────────────────────────────────────────────────
export type ReservationStatus = 'pending' | 'approved' | 'cancelled';

export interface Reservation {
  id: string;
  spaceId: string;
  spaceName?: string;
  userId: string;
  userName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ReservationStatus;
  notes?: string;
  createdAt: number;
}

// ─── Visitor (Profile) ───────────────────────────────────────────────────────
export interface Visitor {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  phone?: string;
  email?: string;
  photoURL?: string;
  createdAt: number;
}

// ─── Visit (Movement) ────────────────────────────────────────────────────────
export type VisitorType = 'family' | 'service' | 'delivery' | 'common';
export type VisitorStatus = 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'denied';

export interface Visit {
  id: string;
  visitorId: string;
  visitorName?: string;
  visitorCpf?: string;
  visitorPhotoURL?: string;
  
  hostUserId: string;
  hostName?: string;
  hostApartment?: string;
  hostBlock?: string;
  
  expectedDate: string; // YYYY-MM-DD
  expectedTime?: string; // HH:mm
  visitorType: VisitorType;
  observations?: string;
  
  status: VisitorStatus;
  qrCode: string;
  checkinAt?: number;
  checkoutAt?: number;
  createdAt: number;
}

// ─── Admin Log ───────────────────────────────────────────────────────────────
export type LogAction = 'create' | 'update' | 'delete';
export type LogTarget = 'user' | 'visitor' | 'notice' | 'event' | 'space' | 'reservation' | 'voting';

export interface AdminLog {
  id: string;
  userId: string;
  userName: string;
  action: LogAction;
  target: LogTarget;
  targetId: string;
  targetName: string;
  details?: string;
  timestamp: number;
}

// ─── Voting ───────────────────────────────────────────────────────────────────
export interface VotingOption {
  id: string;
  label: string;
  votes: number;
}

export type VotingStatus = 'open' | 'closed';

export interface Voting {
  id: string;
  title: string;
  description: string;
  options: VotingOption[];
  voters: Record<string, string>; // uid → optionId
  voteChanges?: Record<string, number>; // uid → count of changes
  status: VotingStatus;
  authorId: string;
  createdAt: number;
  closesAt: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Syndic: undefined;
  Resident: undefined;
  Gatekeeper: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type SyndicTabParamList = {
  Dashboard: undefined;
  NoticesSyndic: undefined;
  Management: undefined;
  ReservationsMgmt: undefined;
  More: undefined;
};

export type ResidentTabParamList = {
  Notices: undefined;
  Reservations: undefined;
  Votings: undefined;
  Visitors: undefined;
  More: undefined;
};

export type GatekeeperTabParamList = {
  ScanQR: undefined;
  VisitorsGK: undefined;
  AccessLog: undefined;
  ResidentsGK: undefined;
};
