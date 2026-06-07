import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid-looking Supabase credentials
const hasCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-project');

// --- LOCAL STORAGE MOCK DATABASE IMPLEMENTATION ---
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Types for Mock Database
interface MockUser {
  id: string;
  email: string;
  password?: string;
  role: 'donor' | 'requester';
}

const mockDbInitialize = () => {
  const users = getStorageItem<MockUser[]>('resq_users', []);
  const profiles = getStorageItem<any[]>('resq_profiles', []);
  const donorDetails = getStorageItem<any[]>('resq_donor_details', []);
  const bloodRequests = getStorageItem<any[]>('resq_blood_requests', []);
  const donationHistory = getStorageItem<any[]>('resq_donation_history', []);
  
  // Create some initial mock data if empty
  if (users.length === 0) {
    // 1. Initial Requester
    const rId = 'mock-req-uuid-1111';
    users.push({ id: rId, email: 'requester@resq.com', role: 'requester' });
    profiles.push({
      id: rId,
      full_name: 'Budi Santoso',
      role: 'requester',
      phone: '081234567890',
      blood_type: 'A+',
      city: 'Jakarta',
      province: 'D.K.I. Jakarta',
      avatar_url: null,
      is_profile_complete: true,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });

    // 2. Initial Donor
    const dId = 'mock-donor-uuid-2222';
    users.push({ id: dId, email: 'donor@resq.com', role: 'donor' });
    profiles.push({
      id: dId,
      full_name: 'Siti Aminah',
      role: 'donor',
      phone: '089876543210',
      blood_type: 'A+',
      city: 'Jakarta',
      province: 'D.K.I. Jakarta',
      avatar_url: null,
      is_profile_complete: true,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
    donorDetails.push({
      id: dId,
      is_available: true,
      last_donated_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 100 days ago, eligible
      weight: 65,
      age: 25,
      total_donations: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 3. Initial Open Blood Request (compatible with Siti)
    const reqId = 'mock-req-post-uuid-3333';
    bloodRequests.push({
      id: reqId,
      requester_id: rId,
      patient_name: 'Rian Santoso',
      blood_type: 'A+',
      bags_needed: 2,
      urgency: 'critical',
      hospital_name: 'Cipto Mangunkusumo Hospital',
      city: 'Jakarta',
      province: 'D.K.I. Jakarta',
      notes: 'Urgently needs A+ blood donor for heart surgery.',
      status: 'open',
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });

    // 4. Initial Donation History for siti
    donationHistory.push({
      id: 'mock-history-uuid-1',
      donor_id: dId,
      match_id: null,
      hospital_name: 'Dharmais Cancer Hospital',
      donated_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bags_donated: 1,
      notes: 'Routine humanitarian blood donation.',
      created_at: new Date().toISOString()
    });

    setStorageItem('resq_users', users);
    setStorageItem('resq_profiles', profiles);
    setStorageItem('resq_donor_details', donorDetails);
    setStorageItem('resq_blood_requests', bloodRequests);
    setStorageItem('resq_donation_history', donationHistory);
  }
};

if (!hasCredentials) {
  mockDbInitialize();
}

// Custom mock state interfaces
let authListeners: Array<(event: string, session: any) => void> = [];

export const mockAuth = {
  signUp: async ({ email, password: _password, options }: any) => {
    console.log('Mock Auth: signUp', email, options);
    const users = getStorageItem<MockUser[]>('resq_users', []);
    if (users.find(u => u.email === email)) {
      return { data: { user: null }, error: new Error('User already exists') };
    }

    const userId = 'user-uuid-' + Math.random().toString(36).substr(2, 9);
    const role = options?.data?.role || 'donor';
    const fullName = options?.data?.full_name || '';

    const newUser = { id: userId, email, role };
    users.push(newUser);
    setStorageItem('resq_users', users);

    // Auto-trigger: insert into public.profiles
    const profiles = getStorageItem<any[]>('resq_profiles', []);
    const newProfile = {
      id: userId,
      full_name: fullName,
      role,
      phone: '',
      blood_type: null,
      city: '',
      province: '',
      avatar_url: null,
      is_profile_complete: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    profiles.push(newProfile);
    setStorageItem('resq_profiles', profiles);

    const session = { access_token: 'mock-token', user: newUser };
    setStorageItem('resq_session', session);
    
    // Notify listeners
    authListeners.forEach(cb => cb('SIGNED_IN', session));

    return { data: { user: newUser, session }, error: null };
  },

  signInWithPassword: async ({ email, password: _password }: any) => {
    console.log('Mock Auth: signInWithPassword', email);
    const users = getStorageItem<MockUser[]>('resq_users', []);
    const user = users.find(u => u.email === email);
    if (!user) {
      return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
    }

    const session = { access_token: 'mock-token', user };
    setStorageItem('resq_session', session);
    
    // Notify listeners
    authListeners.forEach(cb => cb('SIGNED_IN', session));

    return { data: { user, session }, error: null };
  },

  signOut: async () => {
    console.log('Mock Auth: signOut');
    localStorage.removeItem('resq_session');
    authListeners.forEach(cb => cb('SIGNED_OUT', null));
    return { error: null };
  },

  getSession: async () => {
    const session = getStorageItem<any>('resq_session', null);
    return { data: { session }, error: null };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    authListeners.push(callback);
    // Immediately call with current session
    const session = getStorageItem<any>('resq_session', null);
    callback('INITIAL_SESSION', session);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners = authListeners.filter(cb => cb !== callback);
          }
        }
      }
    };
  }
};

class MockQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol: string | null = null;
  private orderDesc: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  private getCollection() {
    return getStorageItem<any[]>(`resq_${this.table}`, []);
  }

  private saveCollection(data: any[]) {
    setStorageItem(`resq_${this.table}`, data);
  }

  select(_columns: string = '*') {
    // Setup select tracking. Joins are simulated internally on retrieve
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => {
      // Handle nested fields or basic comparison
      return item[column] === value;
    });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item: any) => {
      return values.includes(item[column]);
    });
    return this;
  }

  order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.orderCol = column;
    this.orderDesc = !ascending;
    return this;
  }

  async insert(record: any) {
    const data = this.getCollection();
    const records = Array.isArray(record) ? record : [record];
    const newRecords = records.map(r => {
      const newRec = {
        id: r.id || 'uuid-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...r
      };
      
      // Auto triggers logic simulation
      if (this.table === 'donation_history') {
        // Increment donor total donations
        const donorDetails = getStorageItem<any[]>('resq_donor_details', []);
        const detailsIdx = donorDetails.findIndex(d => d.id === r.donor_id);
        if (detailsIdx !== -1) {
          donorDetails[detailsIdx].total_donations = (donorDetails[detailsIdx].total_donations || 0) + (r.bags_donated || 1);
          if (r.donated_at) {
            donorDetails[detailsIdx].last_donated_at = r.donated_at;
          }
          donorDetails[detailsIdx].updated_at = new Date().toISOString();
          setStorageItem('resq_donor_details', donorDetails);
        }
      }
      return newRec;
    });
    
    data.push(...newRecords);
    this.saveCollection(data);
    return { data: Array.isArray(record) ? newRecords : newRecords[0], error: null };
  }

  async upsert(record: any) {
    const data = this.getCollection();
    const records = Array.isArray(record) ? record : [record];
    
    const newRecords = records.map(r => {
      let existingIdx = -1;
      if (this.table === 'screenings' && r.match_id) {
        existingIdx = data.findIndex(x => x.match_id === r.match_id);
      } else if (this.table === 'profiles' && r.id) {
        existingIdx = data.findIndex(x => x.id === r.id);
      } else if (this.table === 'donor_details' && r.id) {
        existingIdx = data.findIndex(x => x.id === r.id);
      } else if (this.table === 'matches' && r.request_id && r.donor_id) {
        existingIdx = data.findIndex(x => x.request_id === r.request_id && x.donor_id === r.donor_id);
      } else if (r.id) {
        existingIdx = data.findIndex(x => x.id === r.id);
      }

      if (existingIdx !== -1) {
        data[existingIdx] = {
          ...data[existingIdx],
          ...r,
          updated_at: new Date().toISOString()
        };
        return data[existingIdx];
      } else {
        const newRec = {
          id: r.id || 'uuid-' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...r
        };
        data.push(newRec);
        return newRec;
      }
    });

    this.saveCollection(data);
    return { data: Array.isArray(record) ? newRecords : newRecords[0], error: null };
  }

  async update(updates: any) {
    const data = this.getCollection();
    let updatedRecords: any[] = [];
    
    const updatedData = data.map(item => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        const updatedItem = {
          ...item,
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        // Simulating matching state side-effects
        if (this.table === 'matches') {
          if (updates.status === 'collected' || updates.status === 'completed') {
            setTimeout(() => {
              const bloodRequests = getStorageItem<any[]>('resq_blood_requests', []);
              const reqIdx = bloodRequests.findIndex(r => r.id === item.request_id);
              if (reqIdx !== -1) {
                bloodRequests[reqIdx].status = 'fulfilled';
                bloodRequests[reqIdx].updated_at = new Date().toISOString();
                setStorageItem('resq_blood_requests', bloodRequests);
              }
            }, 10);
          }
        }

        if (this.table === 'matches' && updates.status === 'completed') {
          // Find the match details to create donation_history
          setTimeout(() => {
            const history = getStorageItem<any[]>('resq_donation_history', []);
            const bloodRequests = getStorageItem<any[]>('resq_blood_requests', []);
            const req = bloodRequests.find(r => r.id === item.request_id);
            
            // Avoid duplicate insertions
            const exists = history.find(h => h.match_id === item.id);
            if (!exists) {
              const newHist = {
                id: 'history-uuid-' + Math.random().toString(36).substr(2, 9),
                donor_id: item.donor_id,
                match_id: item.id,
                hospital_name: req?.hospital_name || 'Hospitals',
                donated_at: new Date().toISOString().split('T')[0],
                bags_donated: 1,
                notes: 'ResQBlood Voluntary Donation Match',
                created_at: new Date().toISOString()
              };
              history.push(newHist);
              setStorageItem('resq_donation_history', history);
              
              // Increment donor details total donations
              const donorDetails = getStorageItem<any[]>('resq_donor_details', []);
              const detailsIdx = donorDetails.findIndex(d => d.id === item.donor_id);
              if (detailsIdx !== -1) {
                donorDetails[detailsIdx].total_donations = (donorDetails[detailsIdx].total_donations || 0) + 1;
                donorDetails[detailsIdx].last_donated_at = new Date().toISOString().split('T')[0];
                donorDetails[detailsIdx].updated_at = new Date().toISOString();
                setStorageItem('resq_donor_details', donorDetails);
              }
            }
          }, 50);
        }
        
        updatedRecords.push(updatedItem);
        return updatedItem;
      }
      return item;
    });

    this.saveCollection(updatedData);
    return { data: updatedRecords, error: null };
  }

  async delete() {
    const data = this.getCollection();
    const filteredData = data.filter(item => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }
      return !matches; // Keep items that DO NOT match filters
    });
    this.saveCollection(filteredData);
    return { error: null };
  }

  async execute() {
    let data = this.getCollection();
    
    // Apply filters
    if (this.filters.length > 0) {
      data = data.filter(item => {
        for (const filter of this.filters) {
          if (!filter(item)) return false;
        }
        return true;
      });
    }

    // Apply sorting
    if (this.orderCol) {
      data.sort((a, b) => {
        const valA = a[this.orderCol!];
        const valB = b[this.orderCol!];
        if (valA === undefined || valB === undefined) return 0;
        
        // Handle sorting for dates, urgency custom ordering, or standard string/number
        if (this.orderCol === 'urgency') {
          const urgencyWeight: Record<string, number> = { critical: 3, urgent: 2, normal: 1 };
          const weightA = urgencyWeight[valA] || 0;
          const weightB = urgencyWeight[valB] || 0;
          return this.orderDesc ? weightB - weightA : weightA - weightB;
        }

        if (typeof valA === 'string') {
          return this.orderDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return this.orderDesc ? valB - valA : valA - valB;
      });
    }

    // Perform joins simulation!
    // 1. Join profiles to blood_requests or matches
    data = data.map(item => {
      const copy = { ...item };
      
      if (this.table === 'blood_requests') {
        const profiles = getStorageItem<any[]>('resq_profiles', []);
        const requesterProfile = profiles.find(p => p.id === item.requester_id);
        if (requesterProfile) {
          copy.profiles = requesterProfile;
        }
      }
      
      if (this.table === 'matches') {
        const profiles = getStorageItem<any[]>('resq_profiles', []);
        const donorProfile = profiles.find(p => p.id === item.donor_id);
        if (donorProfile) {
          const donorDetails = getStorageItem<any[]>('resq_donor_details', []);
          const details = donorDetails.find(d => d.id === donorProfile.id);
          copy.profiles = {
            ...donorProfile,
            donor_details: details || null
          };
        }

        const bloodRequests = getStorageItem<any[]>('resq_blood_requests', []);
        const req = bloodRequests.find(r => r.id === item.request_id);
        if (req) {
          // Also join profiles inside requests
          const requesterProfile = profiles.find(p => p.id === req.requester_id);
          copy.blood_requests = {
            ...req,
            profiles: requesterProfile
          };
        }

        // Simulating joining screenings to matches
        const screenings = getStorageItem<any[]>('resq_screenings', []);
        const matchScreenings = screenings.filter(s => s.match_id === item.id);
        copy.screenings = matchScreenings;
      }
      return copy;
    });

    return { data, error: null };
  }

  // Chain helpers
  then(onfulfilled?: (value: any) => any, onrejected?: (value: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async single() {
    const res = await this.execute();
    return { data: res.data[0] || null, error: res.data[0] ? null : new Error('No row found') };
  }

  async maybeSingle() {
    const res = await this.execute();
    return { data: res.data[0] || null, error: null };
  }
}

export const mockSupabase = {
  auth: mockAuth,
  from: (table: string) => new MockQueryBuilder(table)
};

// Export client wrapper
export const supabase = hasCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (mockSupabase as any);

console.log(`[ResQBlood] Initialized using ${hasCredentials ? 'REAL Supabase client' : 'MOCK database fallback'}`);
