import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useDemoStore = defineStore('demo', () => {
  // État du mode démo
  const isDemoMode = ref(false);
  const sessionId = ref(null);

  // Données de démo en mémoire (réinitialisées à chaque session)
  const demoProspects = ref([]);
  const demoCompanies = ref([]);
  const demoContacts = ref([]);
  const demoTodos = ref([]);
  const demoUser = ref(null);

  // Helper function to calculate future dates
  function getFutureDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  function getTodayISO() {
    return new Date().toISOString().split('T')[0];
  }

  // Initialiser le mode démo avec des données par défaut
  function initDemoMode() {
    isDemoMode.value = true;
    sessionId.value = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Demo user
    demoUser.value = {
      id: 9999,
      username: 'demo',
      email: 'demo@maplyo.com',
      role: 'user',
      full_name: 'Demo User'
    };

    // Demo prospects with US addresses and full sales funnel data
    // Distribution dynamique sur 12 mois à partir d'aujourd'hui
    demoProspects.value = [
      // MOIS 1 (J+12 à J+18) - Mix of hot leads and recurring
      {
        id: 1,
        name: 'TechVision Inc',
        address: '350 5th Avenue, New York, NY 10118',
        latitude: 40.7484,
        longitude: -73.9857,
        status: 'hot',
        revenue: 125000,
        probability_coefficient: 82,
        expected_close_date: getFutureDate(12),
        notes: 'Enterprise software company. C-suite approved budget. Contract review in final stage.',
        contact_name: 'Michael Johnson',
        contact_email: 'm.johnson@techvision.com',
        contact_phone: '+1 (212) 555-0123',
        last_contact_date: getTodayISO(),
        next_action: 'Final contract review',
        company_id: 1,
        assigned_to: 9999,
        created_at: '2025-12-20T10:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 7,
        name: 'NextGen Technologies',
        address: '1201 3rd Avenue, Seattle, WA 98101',
        latitude: 47.6062,
        longitude: -122.3321,
        status: 'recurring',
        revenue: 180000,
        probability_coefficient: 95,
        recurrence_months: 12,
        expected_close_date: getFutureDate(18),
        next_followup_date: getFutureDate(383), // +1 an + 18 jours
        notes: 'Existing customer. Annual renewal. Upsell opportunity for premium features (+$30k).',
        contact_name: 'Christopher Lee',
        contact_email: 'c.lee@nextgentech.com',
        contact_phone: '+1 (206) 555-0789',
        last_contact_date: getTodayISO(),
        next_action: 'Renewal + upsell discussion',
        company_id: 7,
        assigned_to: 9999,
        created_at: '2025-01-15T11:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'CloudFirst Corp',
        address: '1601 Elm Street, Dallas, TX 75201',
        latitude: 32.7767,
        longitude: -96.7970,
        status: 'hot',
        revenue: 175000,
        probability_coefficient: 90,
        expected_close_date: getFutureDate(15),
        notes: 'Contract signed! Implementation starts next month. High confidence.',
        contact_name: 'Jennifer Williams',
        contact_email: 'j.williams@cloudfirst.com',
        contact_phone: '+1 (214) 555-0456',
        last_contact_date: getTodayISO(),
        next_action: 'Onboarding kickoff',
        company_id: 4,
        assigned_to: 9999,
        created_at: '2025-11-01T10:30:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 12,
        name: 'GreenEnergy Corp',
        address: '1500 Broadway, Denver, CO 80202',
        latitude: 39.7392,
        longitude: -104.9903,
        status: 'recurring',
        revenue: 210000,
        probability_coefficient: 94,
        recurrence_months: 6,
        expected_close_date: getFutureDate(9),
        next_followup_date: getFutureDate(192), // +6 mois + 9 jours
        notes: 'Semi-annual contract renewal. Very satisfied customer. Auto-renewal likely.',
        contact_name: 'Kevin Taylor',
        contact_email: 'k.taylor@greenenergy.com',
        contact_phone: '+1 (303) 555-1234',
        last_contact_date: getTodayISO(),
        next_action: 'Renewal confirmation',
        company_id: 12,
        assigned_to: 9999,
        created_at: '2025-07-25T10:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 11,
        name: 'EduTech Solutions',
        address: '1000 S Congress Ave, Austin, TX 78704',
        latitude: 30.2672,
        longitude: -97.7431,
        status: 'warm',
        revenue: 195000,
        probability_coefficient: 75,
        expected_close_date: getFutureDate(17),
        notes: 'Education technology startup. Procurement approved. Legal review in progress.',
        contact_name: 'Lisa Anderson',
        contact_email: 'l.anderson@edutech.com',
        contact_phone: '+1 (512) 555-1123',
        last_contact_date: getTodayISO(),
        next_action: 'Legal review follow-up',
        company_id: 11,
        assigned_to: 9999,
        created_at: '2025-12-01T09:30:00Z',
        updated_at: new Date().toISOString()
      },

      // MOIS 2 (J+36 à J+50) - Strong month
      {
        id: 3,
        name: 'GlobalTech Solutions',
        address: '233 S Wacker Drive, Chicago, IL 60606',
        latitude: 41.8781,
        longitude: -87.6298,
        status: 'hot',
        revenue: 250000,
        probability_coefficient: 85,
        expected_close_date: getFutureDate(36),
        notes: 'Large IT consulting firm. Proposal approved. Waiting for final signatures.',
        contact_name: 'Robert Martinez',
        contact_email: 'r.martinez@globaltech.com',
        contact_phone: '+1 (312) 555-0345',
        last_contact_date: getTodayISO(),
        next_action: 'Contract signature',
        company_id: 3,
        assigned_to: 9999,
        created_at: '2025-11-15T08:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 15,
        name: 'SecureNet Inc',
        address: '201 Mission Street, San Francisco, CA 94105',
        latitude: 37.7897,
        longitude: -122.3972,
        status: 'hot',
        revenue: 285000,
        probability_coefficient: 92,
        expected_close_date: getFutureDate(28),
        notes: 'Cybersecurity firm. Enterprise package finalized. Implementation team ready.',
        contact_name: 'Steven Clark',
        contact_email: 's.clark@securenet.com',
        contact_phone: '+1 (415) 555-1567',
        last_contact_date: getTodayISO(),
        next_action: 'Kickoff meeting',
        company_id: 15,
        assigned_to: 9999,
        created_at: '2025-10-20T09:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 20,
        name: 'HealthFirst Analytics',
        address: '10 E 53rd Street, New York, NY 10022',
        latitude: 40.7614,
        longitude: -73.9776,
        status: 'hot',
        revenue: 340000,
        probability_coefficient: 89,
        expected_close_date: getFutureDate(43),
        notes: 'Healthcare analytics platform. Largest deal in pipeline. Legal cleared.',
        contact_name: 'Dr. Sandra Mitchell',
        contact_email: 's.mitchell@healthfirst.com',
        contact_phone: '+1 (212) 555-2012',
        last_contact_date: getTodayISO(),
        next_action: 'Final approval',
        company_id: 20,
        assigned_to: 9999,
        created_at: '2025-11-05T08:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 18,
        name: 'CloudStream Media',
        address: '5800 Sunset Blvd, Los Angeles, CA 90028',
        latitude: 34.0979,
        longitude: -118.3267,
        status: 'recurring',
        revenue: 155000,
        probability_coefficient: 97,
        recurrence_months: 12,
        expected_close_date: getFutureDate(33),
        next_followup_date: getFutureDate(398), // +1 an + 33 jours
        notes: 'Media streaming service. Annual renewal. Expansion discussion (+2 modules).',
        contact_name: 'Nicole Baker',
        contact_email: 'n.baker@cloudstream.com',
        contact_phone: '+1 (323) 555-1890',
        last_contact_date: getTodayISO(),
        next_action: 'Expansion proposal',
        company_id: 18,
        assigned_to: 9999,
        created_at: '2024-02-10T09:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'InnovateSoft LLC',
        address: '1455 Market Street, San Francisco, CA 94103',
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'warm',
        revenue: 85000,
        probability_coefficient: 65,
        expected_close_date: getFutureDate(46),
        notes: 'SaaS startup. Demo went well. Budget approved. Comparing with one competitor.',
        contact_name: 'Sarah Chen',
        contact_email: 's.chen@innovatesoft.com',
        contact_phone: '+1 (415) 555-0234',
        last_contact_date: getTodayISO(),
        next_action: 'Final pricing proposal',
        company_id: 2,
        assigned_to: 9999,
        created_at: '2025-12-10T09:00:00Z',
        updated_at: new Date().toISOString()
      },

      // MOIS 3 (J+63 à J+78) - Mars
      {
        id: 8,
        name: 'FinTech Solutions Group',
        address: '1717 Main Street, Houston, TX 77002',
        latitude: 29.7604,
        longitude: -95.3698,
        status: 'warm',
        revenue: 310000,
        probability_coefficient: 70,
        expected_close_date: getFutureDate(63),
        notes: 'Large financial services firm. Multiple stakeholders aligned. Procurement in progress.',
        contact_name: 'Amanda White',
        contact_email: 'a.white@fintechsg.com',
        contact_phone: '+1 (713) 555-0890',
        last_contact_date: getTodayISO(),
        next_action: 'Executive presentation',
        company_id: 8,
        assigned_to: 9999,
        created_at: '2025-11-20T08:30:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'DataDrive Systems',
        address: '1100 Peachtree Street NE, Atlanta, GA 30309',
        latitude: 33.7490,
        longitude: -84.3880,
        status: 'recurring',
        revenue: 95000,
        probability_coefficient: 92,
        recurrence_months: 3,
        expected_close_date: getFutureDate(58),
        next_followup_date: getFutureDate(149), // +3 mois + 58 jours
        notes: 'Quarterly subscription renewal. Happy customer. Considering annual switch.',
        contact_name: 'David Brown',
        contact_email: 'd.brown@datadrive.com',
        contact_phone: '+1 (404) 555-0567',
        last_contact_date: getTodayISO(),
        next_action: 'Renewal + annual upgrade discussion',
        company_id: 5,
        assigned_to: 9999,
        created_at: '2025-12-05T14:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 17,
        name: 'AutoTech Industries',
        address: '1 Ford Road, Dearborn, MI 48126',
        latitude: 42.3223,
        longitude: -83.1763,
        status: 'warm',
        revenue: 420000,
        probability_coefficient: 68,
        expected_close_date: getFutureDate(73),
        notes: 'Automotive manufacturer. Large enterprise deployment. Slow but steady progress.',
        contact_name: 'Thomas King',
        contact_email: 't.king@autotech.com',
        contact_phone: '+1 (313) 555-1789',
        last_contact_date: getTodayISO(),
        next_action: 'Procurement committee review',
        company_id: 17,
        assigned_to: 9999,
        created_at: '2025-11-10T10:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Apex Industries',
        address: '500 Boylston Street, Boston, MA 02116',
        latitude: 42.3601,
        longitude: -71.0589,
        status: 'recurring',
        revenue: 165000,
        probability_coefficient: 96,
        recurrence_months: 12,
        expected_close_date: getFutureDate(78),
        next_followup_date: getFutureDate(443), // +1 an + 78 jours
        notes: 'Manufacturing company. Annual renewal. Very satisfied. Considering premium tier.',
        contact_name: 'Emily Davis',
        contact_email: 'e.davis@apexind.com',
        contact_phone: '+1 (617) 555-0678',
        last_contact_date: getTodayISO(),
        next_action: 'Premium tier presentation',
        company_id: 6,
        assigned_to: 9999,
        created_at: '2025-03-31T09:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 13,
        name: 'LogiFlow Systems',
        address: '2000 W Loop S, Houston, TX 77027',
        latitude: 29.7516,
        longitude: -95.4615,
        status: 'warm',
        revenue: 92000,
        probability_coefficient: 55,
        expected_close_date: getFutureDate(68),
        notes: 'Logistics company. Budget confirmed. Evaluating implementation timeline.',
        contact_name: 'Mark Thompson',
        contact_email: 'm.thompson@logiflow.com',
        contact_phone: '+1 (713) 555-1345',
        last_contact_date: getTodayISO(),
        next_action: 'Implementation planning meeting',
        company_id: 13,
        assigned_to: 9999,
        created_at: '2026-01-04T14:00:00Z',
        updated_at: new Date().toISOString()
      },

      // MOIS 4 (J+95 à J+110) - Avril
      {
        id: 9,
        name: 'MediCare Plus',
        address: '3400 Civic Center Blvd, Philadelphia, PA 19104',
        latitude: 39.9526,
        longitude: -75.1652,
        status: 'warm',
        revenue: 140000,
        probability_coefficient: 65,
        expected_close_date: getFutureDate(95),
        notes: 'Healthcare provider. HIPAA compliance review completed. Legal approval pending.',
        contact_name: 'Dr. James Wilson',
        contact_email: 'j.wilson@medicareplus.com',
        contact_phone: '+1 (215) 555-0901',
        last_contact_date: getTodayISO(),
        next_action: 'Legal approval follow-up',
        company_id: 9,
        assigned_to: 9999,
        created_at: '2025-12-15T13:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 19,
        name: 'PropTech Ventures',
        address: '1455 Pennsylvania Ave NW, Washington, DC 20004',
        latitude: 38.8985,
        longitude: -77.0319,
        status: 'warm',
        revenue: 185000,
        probability_coefficient: 64,
        expected_close_date: getFutureDate(102),
        notes: 'Real estate tech company. Strong interest. Final vendor comparison in progress.',
        contact_name: 'Daniel Scott',
        contact_email: 'd.scott@proptech.com',
        contact_phone: '+1 (202) 555-1901',
        last_contact_date: getTodayISO(),
        next_action: 'Competitive analysis presentation',
        company_id: 19,
        assigned_to: 9999,
        created_at: '2025-12-08T13:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 14,
        name: 'DesignWorks Studio',
        address: '600 Congress Ave, Austin, TX 78701',
        latitude: 30.2686,
        longitude: -97.7436,
        status: 'recurring',
        revenue: 68000,
        probability_coefficient: 93,
        recurrence_months: 6,
        expected_close_date: getFutureDate(90),
        next_followup_date: getFutureDate(273), // +6 mois + 90 jours
        notes: 'Creative agency. Semi-annual renewal. Happy with project tracking features.',
        contact_name: 'Rachel Green',
        contact_email: 'r.green@designworks.com',
        contact_phone: '+1 (512) 555-1456',
        last_contact_date: getTodayISO(),
        next_action: 'Renewal confirmation',
        company_id: 14,
        assigned_to: 9999,
        created_at: '2025-10-10T11:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 10,
        name: 'RetailMax Corporation',
        address: '8701 Georgia Ave, Silver Spring, MD 20910',
        latitude: 38.9897,
        longitude: -77.0292,
        status: 'cold',
        revenue: 78000,
        probability_coefficient: 35,
        expected_close_date: getFutureDate(110),
        notes: 'Retail chain. E-commerce expansion project. Budget approved but timeline unclear.',
        contact_name: 'Patricia Moore',
        contact_email: 'p.moore@retailmax.com',
        contact_phone: '+1 (301) 555-1012',
        last_contact_date: getTodayISO(),
        next_action: 'Timeline clarification call',
        company_id: 10,
        assigned_to: 9999,
        created_at: '2026-01-07T11:00:00Z',
        updated_at: new Date().toISOString()
      },

      // MOIS 5 (J+128 à J+143) - Mai
      {
        id: 21,
        name: 'BioMed Research Corp',
        address: '4560 Horton Street, Emeryville, CA 94608',
        latitude: 37.8313,
        longitude: -122.2852,
        status: 'warm',
        revenue: 225000,
        probability_coefficient: 72,
        expected_close_date: getFutureDate(128),
        notes: 'Biotech research company. Looking for lab management integration. Strong fit.',
        contact_name: 'Dr. Rachel Kim',
        contact_email: 'r.kim@biomed.com',
        contact_phone: '+1 (510) 555-2100',
        last_contact_date: getTodayISO(),
        next_action: 'Technical integration demo',
        company_id: 21,
        assigned_to: 9999,
        created_at: '2025-12-20T14:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 16,
        name: 'FoodChain Distributors',
        address: '1800 N Lamar Blvd, Austin, TX 78701',
        latitude: 30.2777,
        longitude: -97.7527,
        status: 'recurring',
        revenue: 105000,
        probability_coefficient: 95,
        recurrence_months: 12,
        expected_close_date: getFutureDate(133),
        next_followup_date: getFutureDate(498), // +1 an + 133 jours
        notes: 'Food distribution network. Annual renewal. Considering warehouse module add-on.',
        contact_name: 'Maria Rodriguez',
        contact_email: 'm.rodriguez@foodchain.com',
        contact_phone: '+1 (512) 555-1678',
        last_contact_date: getTodayISO(),
        next_action: 'Add-on module presentation',
        company_id: 16,
        assigned_to: 9999,
        created_at: '2025-05-20T15:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 22,
        name: 'TechStart Accelerator',
        address: '2100 Milvia Street, Berkeley, CA 94704',
        latitude: 37.8716,
        longitude: -122.2727,
        status: 'warm',
        revenue: 88000,
        probability_coefficient: 60,
        expected_close_date: getFutureDate(143),
        notes: 'Startup accelerator. Managing 50+ portfolio companies. Demo scheduled.',
        contact_name: 'James Patterson',
        contact_email: 'j.patterson@techstart.com',
        contact_phone: '+1 (510) 555-2200',
        last_contact_date: getTodayISO(),
        next_action: 'Portfolio demo presentation',
        company_id: 22,
        assigned_to: 9999,
        created_at: '2025-12-28T09:00:00Z',
        updated_at: new Date().toISOString()
      },

      // MOIS 6 (J+160 à J+175) - Juin
      {
        id: 23,
        name: 'Maritime Logistics Inc',
        address: '1000 2nd Avenue, Seattle, WA 98104',
        latitude: 47.6051,
        longitude: -122.3378,
        status: 'cold',
        revenue: 135000,
        probability_coefficient: 40,
        expected_close_date: getFutureDate(160),
        notes: 'Shipping company. Early stage. Interested in supply chain tracking features.',
        contact_name: 'Captain John Davis',
        contact_email: 'j.davis@maritime.com',
        contact_phone: '+1 (206) 555-2300',
        last_contact_date: getTodayISO(),
        next_action: 'Discovery call scheduled',
        company_id: 23,
        assigned_to: 9999,
        created_at: '2026-01-08T10:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 24,
        name: 'SmartHome Solutions',
        address: '3000 E 1st Avenue, Denver, CO 80206',
        latitude: 39.7178,
        longitude: -104.9534,
        status: 'recurring',
        revenue: 120000,
        probability_coefficient: 94,
        recurrence_months: 12,
        expected_close_date: getFutureDate(175),
        next_followup_date: getFutureDate(540), // +1 an + 175 jours
        notes: 'IoT home automation company. Annual contract. Very satisfied customer.',
        contact_name: 'Emily Zhang',
        contact_email: 'e.zhang@smarthome.com',
        contact_phone: '+1 (303) 555-2400',
        last_contact_date: getTodayISO(),
        next_action: 'Early renewal incentive discussion',
        company_id: 24,
        assigned_to: 9999,
        created_at: '2025-06-30T11:00:00Z',
        updated_at: new Date().toISOString()
      },
      {
        id: 25,
        name: 'ConsultPro Group',
        address: '500 W Madison Street, Chicago, IL 60661',
        latitude: 41.8820,
        longitude: -87.6400,
        status: 'warm',
        revenue: 198000,
        probability_coefficient: 58,
        expected_close_date: getFutureDate(168),
        notes: 'Management consulting firm. Multiple offices. Evaluating multi-location deployment.',
        contact_name: 'Michael Anderson',
        contact_email: 'm.anderson@consultpro.com',
        contact_phone: '+1 (312) 555-2500',
        last_contact_date: getTodayISO(),
        next_action: 'Multi-office demo',
        company_id: 25,
        assigned_to: 9999,
        created_at: '2025-12-18T13:00:00Z',
        updated_at: new Date().toISOString()
      }
    ];

    // Demo companies (20 companies)
    demoCompanies.value = [
      { id: 1, name: 'TechVision Inc', industry: 'Enterprise Software', size: '50-200', website: 'www.techvision.com', created_at: '2025-12-20T10:00:00Z' },
      { id: 2, name: 'InnovateSoft LLC', industry: 'SaaS Startup', size: '10-50', website: 'www.innovatesoft.com', created_at: '2025-12-10T09:00:00Z' },
      { id: 3, name: 'GlobalTech Solutions', industry: 'IT Consulting', size: '200-500', website: 'www.globaltech.com', created_at: '2025-11-15T08:00:00Z' },
      { id: 4, name: 'CloudFirst Corp', industry: 'Cloud Services', size: '50-200', website: 'www.cloudfirst.com', created_at: '2025-11-01T10:30:00Z' },
      { id: 5, name: 'DataDrive Systems', industry: 'Data Analytics', size: '10-50', website: 'www.datadrive.com', created_at: '2025-12-05T14:00:00Z' },
      { id: 6, name: 'Apex Industries', industry: 'Manufacturing', size: '500+', website: 'www.apexind.com', created_at: '2026-01-03T09:00:00Z' },
      { id: 7, name: 'NextGen Technologies', industry: 'Software Development', size: '50-200', website: 'www.nextgentech.com', created_at: '2025-01-15T11:00:00Z' },
      { id: 8, name: 'FinTech Solutions Group', industry: 'Financial Technology', size: '200-500', website: 'www.fintechsg.com', created_at: '2025-11-20T08:30:00Z' },
      { id: 9, name: 'MediCare Plus', industry: 'Healthcare', size: '200-500', website: 'www.medicareplus.com', created_at: '2025-12-15T13:00:00Z' },
      { id: 10, name: 'RetailMax Corporation', industry: 'Retail', size: '500+', website: 'www.retailmax.com', created_at: '2026-01-07T11:00:00Z' },
      { id: 11, name: 'EduTech Solutions', industry: 'Education Technology', size: '50-200', website: 'www.edutech.com', created_at: '2025-12-01T09:30:00Z' },
      { id: 12, name: 'GreenEnergy Corp', industry: 'Renewable Energy', size: '200-500', website: 'www.greenenergy.com', created_at: '2025-11-25T10:00:00Z' },
      { id: 13, name: 'LogiFlow Systems', industry: 'Logistics', size: '50-200', website: 'www.logiflow.com', created_at: '2026-01-04T14:00:00Z' },
      { id: 14, name: 'DesignWorks Studio', industry: 'Creative Agency', size: '10-50', website: 'www.designworks.com', created_at: '2025-12-18T11:00:00Z' },
      { id: 15, name: 'SecureNet Inc', industry: 'Cybersecurity', size: '50-200', website: 'www.securenet.com', created_at: '2025-10-20T09:00:00Z' },
      { id: 16, name: 'FoodChain Distributors', industry: 'Food Distribution', size: '200-500', website: 'www.foodchain.com', created_at: '2026-01-05T15:00:00Z' },
      { id: 17, name: 'AutoTech Industries', industry: 'Automotive', size: '500+', website: 'www.autotech.com', created_at: '2025-11-10T10:00:00Z' },
      { id: 18, name: 'CloudStream Media', industry: 'Media Streaming', size: '50-200', website: 'www.cloudstream.com', created_at: '2024-02-10T09:00:00Z' },
      { id: 19, name: 'PropTech Ventures', industry: 'Real Estate Technology', size: '10-50', website: 'www.proptech.com', created_at: '2025-12-08T13:00:00Z' },
      { id: 20, name: 'HealthFirst Analytics', industry: 'Healthcare Analytics', size: '200-500', website: 'www.healthfirst.com', created_at: '2025-11-05T08:00:00Z' },
      { id: 21, name: 'BioMed Research Corp', industry: 'Biotechnology', size: '200-500', website: 'www.biomed.com', created_at: '2025-12-20T14:00:00Z' },
      { id: 22, name: 'TechStart Accelerator', industry: 'Startup Accelerator', size: '10-50', website: 'www.techstart.com', created_at: '2025-12-28T09:00:00Z' },
      { id: 23, name: 'Maritime Logistics Inc', industry: 'Shipping & Logistics', size: '200-500', website: 'www.maritime.com', created_at: '2026-01-08T10:00:00Z' },
      { id: 24, name: 'SmartHome Solutions', industry: 'IoT Technology', size: '50-200', website: 'www.smarthome.com', created_at: '2025-06-30T11:00:00Z' },
      { id: 25, name: 'ConsultPro Group', industry: 'Management Consulting', size: '200-500', website: 'www.consultpro.com', created_at: '2025-12-18T13:00:00Z' }
    ];

    // Demo contacts (48 contacts - multiple per company)
    demoContacts.value = [
      // TechVision Inc (company_id: 1)
      { id: 1, company_id: 1, name: 'Michael Johnson', email: 'm.johnson@techvision.com', phone: '+1 (212) 555-0123', position: 'VP of Sales', is_primary: true, created_at: '2025-12-20T10:00:00Z' },
      { id: 2, company_id: 1, name: 'Lisa Thompson', email: 'l.thompson@techvision.com', phone: '+1 (212) 555-0124', position: 'CTO', is_primary: false, created_at: '2025-12-20T10:05:00Z' },
      
      // InnovateSoft LLC (company_id: 2)
      { id: 3, company_id: 2, name: 'Sarah Chen', email: 's.chen@innovatesoft.com', phone: '+1 (415) 555-0234', position: 'CEO', is_primary: true, created_at: '2025-12-10T09:00:00Z' },
      { id: 4, company_id: 2, name: 'Alex Kumar', email: 'a.kumar@innovatesoft.com', phone: '+1 (415) 555-0235', position: 'Head of Product', is_primary: false, created_at: '2025-12-10T09:05:00Z' },
      
      // GlobalTech Solutions (company_id: 3)
      { id: 5, company_id: 3, name: 'Robert Martinez', email: 'r.martinez@globaltech.com', phone: '+1 (312) 555-0345', position: 'Procurement Manager', is_primary: true, created_at: '2025-11-15T08:00:00Z' },
      { id: 6, company_id: 3, name: 'Monica Singh', email: 'm.singh@globaltech.com', phone: '+1 (312) 555-0346', position: 'CEO', is_primary: false, created_at: '2025-11-15T08:05:00Z' },
      { id: 7, company_id: 3, name: 'James Park', email: 'j.park@globaltech.com', phone: '+1 (312) 555-0347', position: 'VP of Operations', is_primary: false, created_at: '2025-11-15T08:10:00Z' },
      
      // CloudFirst Corp (company_id: 4)
      { id: 8, company_id: 4, name: 'Jennifer Williams', email: 'j.williams@cloudfirst.com', phone: '+1 (214) 555-0456', position: 'Director of Marketing', is_primary: true, created_at: '2025-11-01T10:30:00Z' },
      { id: 9, company_id: 4, name: 'Tom Bradley', email: 't.bradley@cloudfirst.com', phone: '+1 (214) 555-0457', position: 'CFO', is_primary: false, created_at: '2025-11-01T10:35:00Z' },
      
      // DataDrive Systems (company_id: 5)
      { id: 10, company_id: 5, name: 'David Brown', email: 'd.brown@datadrive.com', phone: '+1 (404) 555-0567', position: 'CTO', is_primary: true, created_at: '2025-12-05T14:00:00Z' },
      { id: 11, company_id: 5, name: 'Rebecca Foster', email: 'r.foster@datadrive.com', phone: '+1 (404) 555-0568', position: 'VP of Sales', is_primary: false, created_at: '2025-12-05T14:05:00Z' },
      { id: 12, company_id: 5, name: 'Carlos Rivera', email: 'c.rivera@datadrive.com', phone: '+1 (404) 555-0569', position: 'Director of Business Development', is_primary: false, created_at: '2025-12-05T14:10:00Z' },
      
      // Apex Industries (company_id: 6)
      { id: 13, company_id: 6, name: 'Emily Davis', email: 'e.davis@apexind.com', phone: '+1 (617) 555-0678', position: 'Operations Director', is_primary: true, created_at: '2026-01-03T09:00:00Z' },
      { id: 14, company_id: 6, name: 'William Roberts', email: 'w.roberts@apexind.com', phone: '+1 (617) 555-0679', position: 'CEO', is_primary: false, created_at: '2026-01-03T09:05:00Z' },
      
      // NextGen Technologies (company_id: 7)
      { id: 15, company_id: 7, name: 'Christopher Lee', email: 'c.lee@nextgentech.com', phone: '+1 (206) 555-0789', position: 'VP of Engineering', is_primary: true, created_at: '2025-01-15T11:00:00Z' },
      { id: 16, company_id: 7, name: 'Sophia Wang', email: 's.wang@nextgentech.com', phone: '+1 (206) 555-0790', position: 'Account Manager', is_primary: false, created_at: '2025-01-15T11:05:00Z' },
      { id: 17, company_id: 7, name: 'Nathan Brooks', email: 'n.brooks@nextgentech.com', phone: '+1 (206) 555-0791', position: 'CTO', is_primary: false, created_at: '2025-01-15T11:10:00Z' },
      
      // FinTech Solutions Group (company_id: 8)
      { id: 18, company_id: 8, name: 'Amanda White', email: 'a.white@fintechsg.com', phone: '+1 (713) 555-0890', position: 'CFO', is_primary: true, created_at: '2025-11-20T08:30:00Z' },
      { id: 19, company_id: 8, name: 'Gregory Hall', email: 'g.hall@fintechsg.com', phone: '+1 (713) 555-0891', position: 'VP of Technology', is_primary: false, created_at: '2025-11-20T08:35:00Z' },
      
      // MediCare Plus (company_id: 9)
      { id: 20, company_id: 9, name: 'Dr. James Wilson', email: 'j.wilson@medicareplus.com', phone: '+1 (215) 555-0901', position: 'Chief Medical Officer', is_primary: true, created_at: '2025-12-15T13:00:00Z' },
      { id: 21, company_id: 9, name: 'Karen Peterson', email: 'k.peterson@medicareplus.com', phone: '+1 (215) 555-0902', position: 'Director of IT', is_primary: false, created_at: '2025-12-15T13:05:00Z' },
      { id: 22, company_id: 9, name: 'Richard Coleman', email: 'r.coleman@medicareplus.com', phone: '+1 (215) 555-0903', position: 'CEO', is_primary: false, created_at: '2025-12-15T13:10:00Z' },
      
      // RetailMax Corporation (company_id: 10)
      { id: 23, company_id: 10, name: 'Patricia Moore', email: 'p.moore@retailmax.com', phone: '+1 (301) 555-1012', position: 'VP of E-Commerce', is_primary: true, created_at: '2026-01-07T11:00:00Z' },
      { id: 24, company_id: 10, name: 'George Hamilton', email: 'g.hamilton@retailmax.com', phone: '+1 (301) 555-1013', position: 'CIO', is_primary: false, created_at: '2026-01-07T11:05:00Z' },
      
      // EduTech Solutions (company_id: 11)
      { id: 25, company_id: 11, name: 'Lisa Anderson', email: 'l.anderson@edutech.com', phone: '+1 (512) 555-1123', position: 'CEO', is_primary: true, created_at: '2025-12-01T09:30:00Z' },
      { id: 26, company_id: 11, name: 'Paul Richardson', email: 'p.richardson@edutech.com', phone: '+1 (512) 555-1124', position: 'VP of Product', is_primary: false, created_at: '2025-12-01T09:35:00Z' },
      
      // GreenEnergy Corp (company_id: 12)
      { id: 27, company_id: 12, name: 'Kevin Taylor', email: 'k.taylor@greenenergy.com', phone: '+1 (303) 555-1234', position: 'VP of Sales', is_primary: true, created_at: '2025-11-25T10:00:00Z' },
      { id: 28, company_id: 12, name: 'Diana Morgan', email: 'd.morgan@greenenergy.com', phone: '+1 (303) 555-1235', position: 'Director of Partnerships', is_primary: false, created_at: '2025-11-25T10:05:00Z' },
      { id: 29, company_id: 12, name: 'Samuel Reed', email: 's.reed@greenenergy.com', phone: '+1 (303) 555-1236', position: 'CFO', is_primary: false, created_at: '2025-11-25T10:10:00Z' },
      
      // LogiFlow Systems (company_id: 13)
      { id: 30, company_id: 13, name: 'Mark Thompson', email: 'm.thompson@logiflow.com', phone: '+1 (713) 555-1345', position: 'Director of Operations', is_primary: true, created_at: '2026-01-04T14:00:00Z' },
      { id: 31, company_id: 13, name: 'Olivia Bennett', email: 'o.bennett@logiflow.com', phone: '+1 (713) 555-1346', position: 'VP of Technology', is_primary: false, created_at: '2026-01-04T14:05:00Z' },
      
      // DesignWorks Studio (company_id: 14)
      { id: 32, company_id: 14, name: 'Rachel Green', email: 'r.green@designworks.com', phone: '+1 (512) 555-1456', position: 'Creative Director', is_primary: true, created_at: '2025-12-18T11:00:00Z' },
      { id: 33, company_id: 14, name: 'Marcus Hayes', email: 'm.hayes@designworks.com', phone: '+1 (512) 555-1457', position: 'CEO', is_primary: false, created_at: '2025-12-18T11:05:00Z' },
      
      // SecureNet Inc (company_id: 15)
      { id: 34, company_id: 15, name: 'Steven Clark', email: 's.clark@securenet.com', phone: '+1 (415) 555-1567', position: 'VP of Enterprise Sales', is_primary: true, created_at: '2025-10-20T09:00:00Z' },
      { id: 35, company_id: 15, name: 'Jennifer Cruz', email: 'j.cruz@securenet.com', phone: '+1 (415) 555-1568', position: 'CTO', is_primary: false, created_at: '2025-10-20T09:05:00Z' },
      { id: 36, company_id: 15, name: 'Brian Powell', email: 'b.powell@securenet.com', phone: '+1 (415) 555-1569', position: 'CEO', is_primary: false, created_at: '2025-10-20T09:10:00Z' },
      
      // FoodChain Distributors (company_id: 16)
      { id: 37, company_id: 16, name: 'Maria Rodriguez', email: 'm.rodriguez@foodchain.com', phone: '+1 (512) 555-1678', position: 'VP of Operations', is_primary: true, created_at: '2026-01-05T15:00:00Z' },
      { id: 38, company_id: 16, name: 'Jonathan Price', email: 'j.price@foodchain.com', phone: '+1 (512) 555-1679', position: 'CFO', is_primary: false, created_at: '2026-01-05T15:05:00Z' },
      
      // AutoTech Industries (company_id: 17)
      { id: 39, company_id: 17, name: 'Thomas King', email: 't.king@autotech.com', phone: '+1 (313) 555-1789', position: 'Procurement Director', is_primary: true, created_at: '2025-11-10T10:00:00Z' },
      { id: 40, company_id: 17, name: 'Victoria Howard', email: 'v.howard@autotech.com', phone: '+1 (313) 555-1790', position: 'VP of Supply Chain', is_primary: false, created_at: '2025-11-10T10:05:00Z' },
      { id: 41, company_id: 17, name: 'Andrew Turner', email: 'a.turner@autotech.com', phone: '+1 (313) 555-1791', position: 'CIO', is_primary: false, created_at: '2025-11-10T10:10:00Z' },
      
      // CloudStream Media (company_id: 18)
      { id: 42, company_id: 18, name: 'Nicole Baker', email: 'n.baker@cloudstream.com', phone: '+1 (323) 555-1890', position: 'VP of Customer Success', is_primary: true, created_at: '2024-02-10T09:00:00Z' },
      { id: 43, company_id: 18, name: 'Brandon Lewis', email: 'b.lewis@cloudstream.com', phone: '+1 (323) 555-1891', position: 'Director of Engineering', is_primary: false, created_at: '2024-02-10T09:05:00Z' },
      
      // PropTech Ventures (company_id: 19)
      { id: 44, company_id: 19, name: 'Daniel Scott', email: 'd.scott@proptech.com', phone: '+1 (202) 555-1901', position: 'VP of Business Development', is_primary: true, created_at: '2025-12-08T13:00:00Z' },
      { id: 45, company_id: 19, name: 'Jessica Adams', email: 'j.adams@proptech.com', phone: '+1 (202) 555-1902', position: 'CEO', is_primary: false, created_at: '2025-12-08T13:05:00Z' },
      
      // HealthFirst Analytics (company_id: 20)
      { id: 46, company_id: 20, name: 'Dr. Sandra Mitchell', email: 's.mitchell@healthfirst.com', phone: '+1 (212) 555-2012', position: 'Chief Analytics Officer', is_primary: true, created_at: '2025-11-05T08:00:00Z' },
      { id: 47, company_id: 20, name: 'Eric Campbell', email: 'e.campbell@healthfirst.com', phone: '+1 (212) 555-2013', position: 'VP of Sales', is_primary: false, created_at: '2025-11-05T08:05:00Z' },
      { id: 48, company_id: 20, name: 'Michelle Carter', email: 'm.carter@healthfirst.com', phone: '+1 (212) 555-2014', position: 'CTO', is_primary: false, created_at: '2025-11-05T08:10:00Z' },
      
      // BioMed Research Corp (company_id: 21)
      { id: 49, company_id: 21, name: 'Dr. Rachel Kim', email: 'r.kim@biomed.com', phone: '+1 (510) 555-2100', position: 'Director of Research', is_primary: true, created_at: '2025-12-20T14:00:00Z' },
      { id: 50, company_id: 21, name: 'Peter Walsh', email: 'p.walsh@biomed.com', phone: '+1 (510) 555-2101', position: 'Lab Manager', is_primary: false, created_at: '2025-12-20T14:05:00Z' },
      
      // TechStart Accelerator (company_id: 22)
      { id: 51, company_id: 22, name: 'James Patterson', email: 'j.patterson@techstart.com', phone: '+1 (510) 555-2200', position: 'Managing Director', is_primary: true, created_at: '2025-12-28T09:00:00Z' },
      { id: 52, company_id: 22, name: 'Samantha Lee', email: 's.lee@techstart.com', phone: '+1 (510) 555-2201', position: 'VP of Operations', is_primary: false, created_at: '2025-12-28T09:05:00Z' },
      
      // Maritime Logistics Inc (company_id: 23)
      { id: 53, company_id: 23, name: 'Captain John Davis', email: 'j.davis@maritime.com', phone: '+1 (206) 555-2300', position: 'Operations Director', is_primary: true, created_at: '2026-01-08T10:00:00Z' },
      { id: 54, company_id: 23, name: 'Laura Martinez', email: 'l.martinez@maritime.com', phone: '+1 (206) 555-2301', position: 'CFO', is_primary: false, created_at: '2026-01-08T10:05:00Z' },
      
      // SmartHome Solutions (company_id: 24)
      { id: 55, company_id: 24, name: 'Emily Zhang', email: 'e.zhang@smarthome.com', phone: '+1 (303) 555-2400', position: 'CEO', is_primary: true, created_at: '2025-06-30T11:00:00Z' },
      { id: 56, company_id: 24, name: 'David Chen', email: 'd.chen@smarthome.com', phone: '+1 (303) 555-2401', position: 'VP of Product', is_primary: false, created_at: '2025-06-30T11:05:00Z' },
      
      // ConsultPro Group (company_id: 25)
      { id: 57, company_id: 25, name: 'Michael Anderson', email: 'm.anderson@consultpro.com', phone: '+1 (312) 555-2500', position: 'Managing Partner', is_primary: true, created_at: '2025-12-18T13:00:00Z' },
      { id: 58, company_id: 25, name: 'Susan Wright', email: 's.wright@consultpro.com', phone: '+1 (312) 555-2501', position: 'Director of Technology', is_primary: false, created_at: '2025-12-18T13:05:00Z' },
      { id: 59, company_id: 25, name: 'Robert Johnson', email: 'r.johnson@consultpro.com', phone: '+1 (312) 555-2502', position: 'VP of Client Services', is_primary: false, created_at: '2025-12-18T13:10:00Z' }
    ];

    // Demo todos (25 todos distributed across prospects)
    demoTodos.value = [
      { id: 1, user_id: 9999, prospect_id: 1, text: 'Final contract review with TechVision legal team', completed: false, due_date: '2026-01-20', priority: 'urgent', created_at: '2026-01-13T14:30:00Z' },
      { id: 2, user_id: 9999, prospect_id: 3, text: 'Follow up on proposal with GlobalTech', completed: false, due_date: '2026-01-15', priority: 'high', created_at: '2026-01-13T16:00:00Z' },
      { id: 3, user_id: 9999, prospect_id: 4, text: 'Prepare onboarding materials for CloudFirst', completed: false, due_date: '2026-01-25', priority: 'high', created_at: '2026-01-14T09:00:00Z' },
      { id: 4, user_id: 9999, prospect_id: 7, text: 'Send renewal contract to NextGen Technologies', completed: false, due_date: '2026-01-25', priority: 'high', created_at: '2026-01-12T14:00:00Z' },
      { id: 5, user_id: 9999, prospect_id: 12, text: 'Confirm renewal with GreenEnergy Corp', completed: false, due_date: '2026-01-17', priority: 'medium', created_at: '2026-01-12T15:00:00Z' },
      { id: 6, user_id: 9999, prospect_id: 11, text: 'Legal review follow-up for EduTech', completed: false, due_date: '2026-01-28', priority: 'medium', created_at: '2026-01-14T11:00:00Z' },
      { id: 7, user_id: 9999, prospect_id: 15, text: 'Schedule kickoff meeting with SecureNet', completed: false, due_date: '2026-02-05', priority: 'high', created_at: '2026-01-14T10:00:00Z' },
      { id: 8, user_id: 9999, prospect_id: 20, text: 'Complete final approval for HealthFirst', completed: false, due_date: '2026-02-20', priority: 'urgent', created_at: '2026-01-14T15:00:00Z' },
      { id: 9, user_id: 9999, prospect_id: 18, text: 'Prepare expansion proposal for CloudStream Media', completed: false, due_date: '2026-02-10', priority: 'medium', created_at: '2026-01-11T16:00:00Z' },
      { id: 10, user_id: 9999, prospect_id: 2, text: 'Send final pricing to InnovateSoft', completed: false, due_date: '2026-02-15', priority: 'high', created_at: '2026-01-12T11:00:00Z' },
      { id: 11, user_id: 9999, prospect_id: 8, text: 'Executive presentation for FinTech Solutions Group', completed: false, due_date: '2026-03-10', priority: 'high', created_at: '2026-01-13T16:30:00Z' },
      { id: 12, user_id: 9999, prospect_id: 5, text: 'Discuss annual upgrade with DataDrive', completed: false, due_date: '2026-03-05', priority: 'medium', created_at: '2026-01-10T10:00:00Z' },
      { id: 13, user_id: 9999, prospect_id: 17, text: 'Procurement committee review with AutoTech', completed: false, due_date: '2026-03-20', priority: 'medium', created_at: '2026-01-13T14:00:00Z' },
      { id: 14, user_id: 9999, prospect_id: 6, text: 'Premium tier presentation for Apex Industries', completed: false, due_date: '2026-03-25', priority: 'medium', created_at: '2026-01-08T15:00:00Z' },
      { id: 15, user_id: 9999, prospect_id: 13, text: 'Implementation planning with LogiFlow', completed: false, due_date: '2026-03-15', priority: 'low', created_at: '2026-01-06T16:00:00Z' },
      { id: 16, user_id: 9999, prospect_id: 9, text: 'Legal approval follow-up for MediCare Plus', completed: false, due_date: '2026-04-10', priority: 'medium', created_at: '2026-01-11T10:30:00Z' },
      { id: 17, user_id: 9999, prospect_id: 19, text: 'Competitive analysis presentation for PropTech', completed: false, due_date: '2026-04-17', priority: 'high', created_at: '2026-01-12T10:00:00Z' },
      { id: 18, user_id: 9999, prospect_id: 14, text: 'Renewal confirmation call with DesignWorks', completed: false, due_date: '2026-04-05', priority: 'medium', created_at: '2026-01-10T13:00:00Z' },
      { id: 19, user_id: 9999, prospect_id: 10, text: 'Timeline clarification with RetailMax', completed: false, due_date: '2026-04-25', priority: 'low', created_at: '2026-01-09T14:00:00Z' },
      { id: 20, user_id: 9999, prospect_id: 21, text: 'Technical integration demo for BioMed Research', completed: false, due_date: '2026-05-10', priority: 'high', created_at: '2026-01-13T11:00:00Z' },
      { id: 21, user_id: 9999, prospect_id: 16, text: 'Present warehouse module to FoodChain', completed: false, due_date: '2026-05-15', priority: 'medium', created_at: '2026-01-07T11:00:00Z' },
      { id: 22, user_id: 9999, prospect_id: 22, text: 'Portfolio demo for TechStart Accelerator', completed: false, due_date: '2026-05-20', priority: 'medium', created_at: '2026-01-11T15:00:00Z' },
      { id: 23, user_id: 9999, prospect_id: 23, text: 'Discovery call with Maritime Logistics', completed: false, due_date: '2026-06-10', priority: 'low', created_at: '2026-01-09T16:00:00Z' },
      { id: 24, user_id: 9999, prospect_id: 24, text: 'Early renewal incentive discussion with SmartHome', completed: false, due_date: '2026-06-15', priority: 'medium', created_at: '2026-01-10T14:00:00Z' },
      { id: 25, user_id: 9999, prospect_id: 25, text: 'Multi-office demo for ConsultPro Group', completed: false, due_date: '2026-06-18', priority: 'high', created_at: '2026-01-12T10:00:00Z' },
      { id: 26, user_id: 9999, prospect_id: null, text: 'Update weekly sales pipeline report', completed: false, due_date: '2026-01-17', priority: 'low', created_at: '2026-01-13T08:00:00Z' },
      { id: 27, user_id: 9999, prospect_id: null, text: 'Prepare Q1 forecast presentation', completed: false, due_date: '2026-03-25', priority: 'medium', created_at: '2026-01-13T09:00:00Z' }
    ];

    // Save initial state to sessionStorage
    saveToSessionStorage();
  }

  // Sauvegarder les données dans sessionStorage
  function saveToSessionStorage() {
    if (!isDemoMode.value) return;
    
    sessionStorage.setItem('demoMode', JSON.stringify({
      isDemoMode: isDemoMode.value,
      sessionId: sessionId.value,
      prospects: demoProspects.value,
      companies: demoCompanies.value,
      contacts: demoContacts.value,
      todos: demoTodos.value,
      user: demoUser.value
    }));
  }

  // Charger les données depuis sessionStorage
  function loadFromSessionStorage() {
    const saved = sessionStorage.getItem('demoMode');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        isDemoMode.value = data.isDemoMode || false;
        sessionId.value = data.sessionId;
        demoProspects.value = data.prospects || [];
        demoCompanies.value = data.companies || [];
        demoContacts.value = data.contacts || [];
        demoTodos.value = data.todos || [];
        demoUser.value = data.user;
        return true;
      } catch (e) {
        console.error('Erreur lors du chargement des données démo:', e);
        return false;
      }
    }
    return false;
  }

  // Quitter le mode démo
  function exitDemoMode() {
    isDemoMode.value = false;
    sessionId.value = null;
    demoProspects.value = [];
    demoCompanies.value = [];
    demoContacts.value = [];
    demoTodos.value = [];
    demoUser.value = null;
    sessionStorage.removeItem('demoMode');
    
    // Nettoyer aussi les données auth du sessionStorage
    sessionStorage.removeItem('maplyo_auth_token');
    sessionStorage.removeItem('maplyo_auth_user');
    sessionStorage.removeItem('maplyo_login_time');
  }

  // Méthodes CRUD pour les prospects en mode démo
  function getDemoProspects() {
    return demoProspects.value;
  }

  function getDemoProspectById(id) {
    return demoProspects.value.find(p => p.id === id);
  }

  function createDemoProspect(prospect) {
    const newId = Math.max(...demoProspects.value.map(p => p.id), 0) + 1;
    const newProspect = {
      ...prospect,
      id: newId,
      assigned_to: 9999,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    demoProspects.value.push(newProspect);
    saveToSessionStorage();
    return newProspect;
  }

  function updateDemoProspect(id, updates) {
    const index = demoProspects.value.findIndex(p => p.id === id);
    if (index !== -1) {
      demoProspects.value[index] = {
        ...demoProspects.value[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveToSessionStorage();
      return demoProspects.value[index];
    }
    return null;
  }

  function deleteDemoProspect(id) {
    const index = demoProspects.value.findIndex(p => p.id === id);
    if (index !== -1) {
      demoProspects.value.splice(index, 1);
      saveToSessionStorage();
      return true;
    }
    return false;
  }

  // Méthodes CRUD pour les todos en mode démo
  function getDemoTodos() {
    return demoTodos.value;
  }

  function createDemoTodo(todo) {
    const newId = Math.max(...demoTodos.value.map(t => t.id), 0) + 1;
    const newTodo = {
      ...todo,
      id: newId,
      user_id: 9999,
      created_at: new Date().toISOString()
    };
    demoTodos.value.push(newTodo);
    saveToSessionStorage();
    return newTodo;
  }

  function updateDemoTodo(id, updates) {
    const index = demoTodos.value.findIndex(t => t.id === id);
    if (index !== -1) {
      demoTodos.value[index] = {
        ...demoTodos.value[index],
        ...updates
      };
      saveToSessionStorage();
      return demoTodos.value[index];
    }
    return null;
  }

  function deleteDemoTodo(id) {
    const index = demoTodos.value.findIndex(t => t.id === id);
    if (index !== -1) {
      demoTodos.value.splice(index, 1);
      saveToSessionStorage();
      return true;
    }
    return false;
  }

  // Méthodes pour les companies
  function getDemoCompanies() {
    return demoCompanies.value;
  }

  function createDemoCompany(company) {
    const newId = Math.max(...demoCompanies.value.map(c => c.id), 0) + 1;
    const newCompany = {
      ...company,
      id: newId,
      created_at: new Date().toISOString()
    };
    demoCompanies.value.push(newCompany);
    saveToSessionStorage();
    return newCompany;
  }

  function updateDemoCompany(id, updates) {
    const index = demoCompanies.value.findIndex(c => c.id === id);
    if (index !== -1) {
      demoCompanies.value[index] = {
        ...demoCompanies.value[index],
        ...updates
      };
      saveToSessionStorage();
      return demoCompanies.value[index];
    }
    return null;
  }

  function deleteDemoCompany(id) {
    const index = demoCompanies.value.findIndex(c => c.id === id);
    if (index !== -1) {
      demoCompanies.value.splice(index, 1);
      saveToSessionStorage();
      return true;
    }
    return false;
  }

  // Méthodes pour les contacts
  function getDemoContacts() {
    return demoContacts.value;
  }

  function createDemoContact(contact) {
    const newId = Math.max(...demoContacts.value.map(c => c.id), 0) + 1;
    const newContact = {
      ...contact,
      id: newId,
      created_at: new Date().toISOString()
    };
    demoContacts.value.push(newContact);
    saveToSessionStorage();
    return newContact;
  }

  function updateDemoContact(id, updates) {
    const index = demoContacts.value.findIndex(c => c.id === id);
    if (index !== -1) {
      demoContacts.value[index] = {
        ...demoContacts.value[index],
        ...updates
      };
      saveToSessionStorage();
      return demoContacts.value[index];
    }
    return null;
  }

  function deleteDemoContact(id) {
    const index = demoContacts.value.findIndex(c => c.id === id);
    if (index !== -1) {
      demoContacts.value.splice(index, 1);
      saveToSessionStorage();
      return true;
    }
    return false;
  }

  function getDemoContactsByCompany(companyId) {
    return demoContacts.value.filter(c => c.company_id === companyId);
  }

  function getDemoContactById(id) {
    return demoContacts.value.find(c => c.id === id);
  }

  function linkContactToCompany(contactId, companyId) {
    const contact = getDemoContactById(contactId);
    if (contact) {
      contact.company_id = companyId;
      saveToSessionStorage();
      return true;
    }
    return false;
  }

  function unlinkContactFromCompany(contactId) {
    const contact = getDemoContactById(contactId);
    if (contact) {
      contact.company_id = null;
      contact.is_primary = false;
      saveToSessionStorage();
      return true;
    }
    return false;
  }

  function setPrimaryContact(companyId, contactId, isPrimary) {
    // Si on définit un contact comme principal, retirer le statut des autres
    if (isPrimary) {
      demoContacts.value.forEach(c => {
        if (c.company_id === companyId && c.id !== contactId) {
          c.is_primary = false;
        }
      });
    }
    
    const contact = getDemoContactById(contactId);
    if (contact) {
      contact.is_primary = isPrimary;
      saveToSessionStorage();
      return true;
    }
    return false;
  }

  function getDemoCompanyById(id) {
    return demoCompanies.value.find(c => c.id === id);
  }

  return {
    // État
    isDemoMode,
    sessionId,
    demoUser,
    
    // Actions
    initDemoMode,
    exitDemoMode,
    loadFromSessionStorage,
    saveToSessionStorage,
    
    // Prospects
    getDemoProspects,
    getDemoProspectById,
    createDemoProspect,
    updateDemoProspect,
    deleteDemoProspect,
    
    // Todos
    getDemoTodos,
    createDemoTodo,
    updateDemoTodo,
    deleteDemoTodo,
    
    // Companies
    getDemoCompanies,
    createDemoCompany,
    updateDemoCompany,
    deleteDemoCompany,
    
    // Contacts
    getDemoContacts,
    getDemoContactById,
    getDemoContactsByCompany,
    createDemoContact,
    updateDemoContact,
    deleteDemoContact,
    linkContactToCompany,
    unlinkContactFromCompany,
    setPrimaryContact,
    getDemoCompanyById
  };
});
