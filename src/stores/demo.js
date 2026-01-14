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
        name: 'Migration Cloud Enterprise Q1',
        address: '350 5th Avenue, New York, NY 10118',
        latitude: 40.7484,
        longitude: -73.9857,
        status: 'hot',
        revenue: 125000,
        probability_coefficient: 82,
        expected_close_date: getFutureDate(20),
        estimated_completion_date: getFutureDate(20),
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
        name: 'Annual Renewal + Premium Features',
        address: '1201 3rd Avenue, Seattle, WA 98101',
        latitude: 47.6062,
        longitude: -122.3321,
        status: 'recurring',
        revenue: 180000,
        probability_coefficient: 95,
        recurrence_months: 12,
        expected_close_date: getFutureDate(45),
        next_followup_date: getFutureDate(410), // +1 an + 18 jours
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
        name: 'Cloud Infrastructure Project 2026',
        address: '1601 Elm Street, Dallas, TX 75201',
        latitude: 32.7767,
        longitude: -96.7970,
        status: 'hot',
        revenue: 175000,
        probability_coefficient: 90,
        expected_close_date: getFutureDate(60),
        estimated_completion_date: getFutureDate(60),
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
        name: 'Semi-Annual Contract - Energy Monitoring',
        address: '1500 Broadway, Denver, CO 80202',
        latitude: 39.7392,
        longitude: -104.9903,
        status: 'recurring',
        revenue: 210000,
        probability_coefficient: 94,
        recurrence_months: 6,
        expected_close_date: getFutureDate(80),
        next_followup_date: getFutureDate(263), // +6 mois + 9 jours
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
        name: 'Digital Campus E-Learning Platform',
        address: '1000 S Congress Ave, Austin, TX 78704',
        latitude: 30.2672,
        longitude: -97.7431,
        status: 'warm',
        revenue: 195000,
        probability_coefficient: 75,
        expected_close_date: getFutureDate(105),
        estimated_completion_date: getFutureDate(105),
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
        name: 'Digital Transformation - Consulting Suite',
        address: '233 S Wacker Drive, Chicago, IL 60606',
        latitude: 41.8781,
        longitude: -87.6298,
        status: 'hot',
        revenue: 250000,
        probability_coefficient: 85,
        expected_close_date: getFutureDate(120),
        estimated_completion_date: getFutureDate(120),
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
        name: 'Enterprise Security Pack + SOC Integration',
        address: '201 Mission Street, San Francisco, CA 94105',
        latitude: 37.7897,
        longitude: -122.3972,
        status: 'hot',
        revenue: 285000,
        probability_coefficient: 92,
        expected_close_date: getFutureDate(140),
        estimated_completion_date: getFutureDate(140),
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
        name: 'Multi-Site Medical Analytics Solution',
        address: '10 E 53rd Street, New York, NY 10022',
        latitude: 40.7614,
        longitude: -73.9776,
        status: 'hot',
        revenue: 340000,
        probability_coefficient: 89,
        expected_close_date: getFutureDate(165),
        estimated_completion_date: getFutureDate(165),
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
        name: 'Renewal + CDN & Analytics Extension',
        address: '5800 Sunset Blvd, Los Angeles, CA 90028',
        latitude: 34.0979,
        longitude: -118.3267,
        status: 'recurring',
        revenue: 155000,
        probability_coefficient: 97,
        recurrence_months: 12,
        expected_close_date: getFutureDate(180),
        next_followup_date: getFutureDate(545), // +1 an + 33 jours
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
        name: 'Licence SaaS Starter - 25 Users',
        address: '1455 Market Street, San Francisco, CA 94103',
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'warm',
        revenue: 85000,
        probability_coefficient: 65,
        expected_close_date: getFutureDate(210),
        estimated_completion_date: getFutureDate(210),
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
        name: 'Digital Banking 2.0 Platform',
        address: '1717 Main Street, Houston, TX 77002',
        latitude: 29.7604,
        longitude: -95.3698,
        status: 'warm',
        revenue: 310000,
        probability_coefficient: 70,
        expected_close_date: getFutureDate(225),
        estimated_completion_date: getFutureDate(225),
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
        name: 'Quarterly Analytics Pro Subscription',
        address: '1100 Peachtree Street NE, Atlanta, GA 30309',
        latitude: 33.7490,
        longitude: -84.3880,
        status: 'recurring',
        revenue: 95000,
        probability_coefficient: 92,
        recurrence_months: 3,
        expected_close_date: getFutureDate(240),
        next_followup_date: getFutureDate(331), // +3 mois + 58 jours
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
        name: 'Suite IoT Manufacturing - 15 Sites',
        address: '1 Ford Road, Dearborn, MI 48126',
        latitude: 42.3223,
        longitude: -83.1763,
        status: 'warm',
        revenue: 420000,
        probability_coefficient: 68,
        expected_close_date: getFutureDate(265),
        estimated_completion_date: getFutureDate(265),
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
        name: 'ERP Renewal + Premium Tier',
        address: '500 Boylston Street, Boston, MA 02116',
        latitude: 42.3601,
        longitude: -71.0589,
        status: 'recurring',
        revenue: 165000,
        probability_coefficient: 96,
        recurrence_months: 12,
        expected_close_date: getFutureDate(285),
        next_followup_date: getFutureDate(650), // +1 an + 78 jours
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
        name: 'Fleet Management & GPS Tracking Solution',
        address: '2000 W Loop S, Houston, TX 77027',
        latitude: 29.7516,
        longitude: -95.4615,
        status: 'warm',
        revenue: 92000,
        probability_coefficient: 55,
        expected_close_date: getFutureDate(300),
        estimated_completion_date: getFutureDate(300),
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
        name: 'HIPAA Compliant Electronic Medical Records',
        address: '3400 Civic Center Blvd, Philadelphia, PA 19104',
        latitude: 39.9526,
        longitude: -75.1652,
        status: 'warm',
        revenue: 140000,
        probability_coefficient: 65,
        expected_close_date: getFutureDate(330),
        estimated_completion_date: getFutureDate(330),
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
        name: 'Real Estate CRM + Client Portal',
        address: '1455 Pennsylvania Ave NW, Washington, DC 20004',
        latitude: 38.8985,
        longitude: -77.0319,
        status: 'warm',
        revenue: 185000,
        probability_coefficient: 64,
        expected_close_date: getFutureDate(350),
        estimated_completion_date: getFutureDate(350),
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
        name: 'Semi-Annual Project Manager Pro Renewal',
        address: '600 Congress Ave, Austin, TX 78701',
        latitude: 30.2686,
        longitude: -97.7436,
        status: 'recurring',
        revenue: 68000,
        probability_coefficient: 93,
        recurrence_months: 6,
        expected_close_date: getFutureDate(370),
        next_followup_date: getFutureDate(553), // +6 mois + 90 jours
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
        name: 'Omnichannel E-Commerce Expansion',
        address: '8701 Georgia Ave, Silver Spring, MD 20910',
        latitude: 38.9897,
        longitude: -77.0292,
        status: 'cold',
        revenue: 78000,
        probability_coefficient: 35,
        expected_close_date: getFutureDate(390),
        estimated_completion_date: getFutureDate(390),
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
        name: 'Laboratory LIMS System - 3 Sites',
        address: '4560 Horton Street, Emeryville, CA 94608',
        latitude: 37.8313,
        longitude: -122.2852,
        status: 'warm',
        revenue: 225000,
        probability_coefficient: 72,
        expected_close_date: getFutureDate(420),
        estimated_completion_date: getFutureDate(420),
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
        name: 'Renewal + Warehouse Management Module',
        address: '1800 N Lamar Blvd, Austin, TX 78701',
        latitude: 30.2777,
        longitude: -97.7527,
        status: 'recurring',
        revenue: 105000,
        probability_coefficient: 95,
        recurrence_months: 12,
        expected_close_date: getFutureDate(445),
        next_followup_date: getFutureDate(810), // +1 an + 133 jours
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
        name: 'Startup Portfolio Management Platform',
        address: '2100 Milvia Street, Berkeley, CA 94704',
        latitude: 37.8716,
        longitude: -122.2727,
        status: 'warm',
        revenue: 88000,
        probability_coefficient: 60,
        expected_close_date: getFutureDate(465),
        estimated_completion_date: getFutureDate(465),
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
        name: 'Maritime Supply Chain Solution',
        address: '1000 2nd Avenue, Seattle, WA 98104',
        latitude: 47.6051,
        longitude: -122.3378,
        status: 'cold',
        revenue: 135000,
        probability_coefficient: 40,
        expected_close_date: getFutureDate(495),
        estimated_completion_date: getFutureDate(495),
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
        name: 'Annual IoT Platform Renewal',
        address: '3000 E 1st Avenue, Denver, CO 80206',
        latitude: 39.7178,
        longitude: -104.9534,
        status: 'recurring',
        revenue: 120000,
        probability_coefficient: 94,
        recurrence_months: 12,
        expected_close_date: getFutureDate(515),
        next_followup_date: getFutureDate(880), // +1 an + 175 jours
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
        name: 'Multi-Site Deployment - 8 Offices',
        address: '500 W Madison Street, Chicago, IL 60661',
        latitude: 41.8820,
        longitude: -87.6400,
        status: 'warm',
        revenue: 198000,
        probability_coefficient: 58,
        expected_close_date: getFutureDate(540),
        estimated_completion_date: getFutureDate(540),
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
      },

      // Leads supplémentaires pour avoir plusieurs opportunités par société

      // TechVision Inc - 2ème opportunité (company_id: 1)
      {
        id: 26,
        name: 'Premium Training & Support - 1 Year',
        address: '350 5th Avenue, New York, NY 10118',
        latitude: 40.7484,
        longitude: -73.9857,
        status: 'warm',
        revenue: 45000,
        probability_coefficient: 78,
        expected_close_date: getFutureDate(90),
        estimated_completion_date: getFutureDate(90),
        notes: 'Package formation et support pour accompagner le déploiement principal.',
        contact_name: 'Lisa Thompson',
        contact_email: 'l.thompson@techvision.com',
        contact_phone: '+1 (212) 555-0124',
        last_contact_date: getTodayISO(),
        next_action: 'Proposal review',
        company_id: 1,
        assigned_to: 9999,
        created_at: '2026-01-10T10:00:00Z',
        updated_at: new Date().toISOString()
      },

      // GlobalTech Solutions - 2ème opportunité (company_id: 3)
      {
        id: 27,
        name: 'Module Analytics & BI Add-on',
        address: '233 S Wacker Drive, Chicago, IL 60606',
        latitude: 41.8781,
        longitude: -87.6298,
        status: 'cold',
        revenue: 95000,
        probability_coefficient: 45,
        expected_close_date: getFutureDate(180),
        estimated_completion_date: getFutureDate(180),
        notes: 'Extension analytics pour le système principal. En discussion préliminaire.',
        contact_name: 'James Park',
        contact_email: 'j.park@globaltech.com',
        contact_phone: '+1 (312) 555-0347',
        last_contact_date: getTodayISO(),
        next_action: 'Technical requirements gathering',
        company_id: 3,
        assigned_to: 9999,
        created_at: '2026-01-11T14:00:00Z',
        updated_at: new Date().toISOString()
      },

      // CloudFirst Corp - 2ème opportunité (company_id: 4)
      {
        id: 28,
        name: 'Professional Services - Data Migration',
        address: '1601 Elm Street, Dallas, TX 75201',
        latitude: 32.7767,
        longitude: -96.7970,
        status: 'hot',
        revenue: 65000,
        probability_coefficient: 88,
        expected_close_date: getFutureDate(70),
        estimated_completion_date: getFutureDate(70),
        notes: 'Services de migration de données legacy vers nouvelle plateforme.',
        contact_name: 'Tom Bradley',
        contact_email: 't.bradley@cloudfirst.com',
        contact_phone: '+1 (214) 555-0457',
        last_contact_date: getTodayISO(),
        next_action: 'SOW signature',
        company_id: 4,
        assigned_to: 9999,
        created_at: '2026-01-09T11:00:00Z',
        updated_at: new Date().toISOString()
      },

      // DataDrive Systems - 2ème opportunité (company_id: 5)
      {
        id: 29,
        name: 'Enterprise Plan Upgrade',
        address: '1100 Peachtree Street NE, Atlanta, GA 30309',
        latitude: 33.7490,
        longitude: -84.3880,
        status: 'warm',
        revenue: 145000,
        probability_coefficient: 70,
        expected_close_date: getFutureDate(150),
        estimated_completion_date: getFutureDate(150),
        notes: 'Upgrade du plan actuel vers Enterprise. Discussion sur fonctionnalités avancées.',
        contact_name: 'Rebecca Foster',
        contact_email: 'r.foster@datadrive.com',
        contact_phone: '+1 (404) 555-0568',
        last_contact_date: getTodayISO(),
        next_action: 'Enterprise features demo',
        company_id: 5,
        assigned_to: 9999,
        created_at: '2026-01-12T09:00:00Z',
        updated_at: new Date().toISOString()
      },

      // NextGen Technologies - 2ème opportunité (company_id: 7)
      {
        id: 30,
        name: 'API Extension & Third-Party Integrations',
        address: '1201 3rd Avenue, Seattle, WA 98101',
        latitude: 47.6062,
        longitude: -122.3321,
        status: 'warm',
        revenue: 75000,
        probability_coefficient: 72,
        expected_close_date: getFutureDate(200),
        estimated_completion_date: getFutureDate(200),
        notes: 'Package intégrations avec leurs systèmes existants (Salesforce, SAP).',
        contact_name: 'Nathan Brooks',
        contact_email: 'n.brooks@nextgentech.com',
        contact_phone: '+1 (206) 555-0791',
        last_contact_date: getTodayISO(),
        next_action: 'Integration architecture review',
        company_id: 7,
        assigned_to: 9999,
        created_at: '2026-01-08T15:00:00Z',
        updated_at: new Date().toISOString()
      },

      // FinTech Solutions Group - 2ème opportunité (company_id: 8)
      {
        id: 31,
        name: 'Compliance & Financial Reporting Module',
        address: '1717 Main Street, Houston, TX 77002',
        latitude: 29.7604,
        longitude: -95.3698,
        status: 'cold',
        revenue: 185000,
        probability_coefficient: 38,
        expected_close_date: getFutureDate(320),
        estimated_completion_date: getFutureDate(320),
        notes: 'Module spécialisé pour conformité réglementaire bancaire. Prospection initiale.',
        contact_name: 'Gregory Hall',
        contact_email: 'g.hall@fintechsg.com',
        contact_phone: '+1 (713) 555-0891',
        last_contact_date: getTodayISO(),
        next_action: 'Compliance requirements analysis',
        company_id: 8,
        assigned_to: 9999,
        created_at: '2026-01-13T10:00:00Z',
        updated_at: new Date().toISOString()
      },

      // SecureNet Inc - 2ème opportunité (company_id: 15)
      {
        id: 32,
        name: 'Advanced Security Training - IT Team',
        address: '201 Mission Street, San Francisco, CA 94105',
        latitude: 37.7897,
        longitude: -122.3972,
        status: 'warm',
        revenue: 38000,
        probability_coefficient: 80,
        expected_close_date: getFutureDate(160),
        estimated_completion_date: getFutureDate(160),
        notes: 'Programme de formation pour leur équipe de sécurité interne.',
        contact_name: 'Steven Clark',
        contact_email: 's.clark@securenet.com',
        contact_phone: '+1 (415) 555-1567',
        last_contact_date: getTodayISO(),
        next_action: 'Training program proposal',
        company_id: 15,
        assigned_to: 9999,
        created_at: '2026-01-14T11:00:00Z',
        updated_at: new Date().toISOString()
      },

      // HealthFirst Analytics - 2ème opportunité (company_id: 20)
      {
        id: 33,
        name: 'Telemedicine & Patient Portal Module',
        address: '10 E 53rd Street, New York, NY 10022',
        latitude: 40.7614,
        longitude: -73.9776,
        status: 'warm',
        revenue: 210000,
        probability_coefficient: 68,
        expected_close_date: getFutureDate(280),
        estimated_completion_date: getFutureDate(280),
        notes: 'Extension télémédecine pour compléter la plateforme analytics existante.',
        contact_name: 'Dr. Sandra Mitchell',
        contact_email: 's.mitchell@healthfirst.com',
        contact_phone: '+1 (212) 555-2012',
        last_contact_date: getTodayISO(),
        next_action: 'Telemedicine platform demo',
        company_id: 20,
        assigned_to: 9999,
        created_at: '2026-01-15T09:00:00Z',
        updated_at: new Date().toISOString()
      },

      // InnovateSoft LLC - 2ème opportunité (company_id: 2)
      {
        id: 34,
        name: 'Add-on Mobile App Development',
        address: '1455 Market Street, San Francisco, CA 94103',
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'cold',
        revenue: 55000,
        probability_coefficient: 42,
        expected_close_date: getFutureDate(250),
        estimated_completion_date: getFutureDate(250),
        notes: 'Application mobile native iOS/Android pour compléter la solution web.',
        contact_name: 'Alex Kumar',
        contact_email: 'a.kumar@innovatesoft.com',
        contact_phone: '+1 (415) 555-0235',
        last_contact_date: getTodayISO(),
        next_action: 'Mobile requirements discovery',
        company_id: 2,
        assigned_to: 9999,
        created_at: '2026-01-16T14:00:00Z',
        updated_at: new Date().toISOString()
      },

      // Apex Industries - 2ème opportunité (company_id: 6)
      {
        id: 35,
        name: 'IoT Sensors Integration - Main Factory',
        address: '500 Boylston Street, Boston, MA 02116',
        latitude: 42.3601,
        longitude: -71.0589,
        status: 'warm',
        revenue: 280000,
        probability_coefficient: 62,
        expected_close_date: getFutureDate(340),
        estimated_completion_date: getFutureDate(340),
        notes: 'Intégration capteurs IoT pour monitoring production temps réel.',
        contact_name: 'William Roberts',
        contact_email: 'w.roberts@apexind.com',
        contact_phone: '+1 (617) 555-0679',
        last_contact_date: getTodayISO(),
        next_action: 'Factory site visit & assessment',
        company_id: 6,
        assigned_to: 9999,
        created_at: '2026-01-17T10:00:00Z',
        updated_at: new Date().toISOString()
      },

      // EUROPEAN LEADS

      // DigiTech Industries France (company_id: 26)
      {
        id: 36,
        name: 'ERP Modernization Project',
        address: '35 Rue Joseph Monier, Rueil-Malmaison, 92500, France',
        latitude: 48.8766,
        longitude: 2.1833,
        status: 'hot',
        revenue: 320000,
        probability_coefficient: 85,
        expected_close_date: getFutureDate(45),
        estimated_completion_date: getFutureDate(45),
        notes: 'Large French industrial company. Legacy system modernization. Strong alignment.',
        contact_name: 'Jean-Pierre Dubois',
        contact_email: 'jp.dubois@digitech-industries.fr',
        contact_phone: '+33 1 47 14 20 00',
        last_contact_date: getTodayISO(),
        next_action: 'Contract finalization',
        company_id: 26,
        assigned_to: 9999,
        created_at: '2025-11-28T09:00:00Z',
        updated_at: new Date().toISOString()
      },

      // AutoVision Systems GmbH (company_id: 27)
      {
        id: 37,
        name: 'Supply Chain Digitalization - Munich Plant',
        address: 'Petuelring 130, Munich, 80788, Germany',
        latitude: 48.1775,
        longitude: 11.5582,
        status: 'warm',
        revenue: 450000,
        probability_coefficient: 72,
        expected_close_date: getFutureDate(110),
        estimated_completion_date: getFutureDate(110),
        notes: 'Automotive supplier. Complex requirements. Multiple stakeholders engaged.',
        contact_name: 'Dr. Klaus Mueller',
        contact_email: 'k.mueller@autovision-systems.de',
        contact_phone: '+49 89 382 00',
        last_contact_date: getTodayISO(),
        next_action: 'Technical workshop',
        company_id: 27,
        assigned_to: 9999,
        created_at: '2025-12-05T10:00:00Z',
        updated_at: new Date().toISOString()
      },

      // FinTech London Ltd (company_id: 28)
      {
        id: 38,
        name: 'Regulatory Compliance Platform UK',
        address: '25 Canada Square, Canary Wharf, London, E14 5LQ, UK',
        latitude: 51.5045,
        longitude: -0.0195,
        status: 'hot',
        revenue: 275000,
        probability_coefficient: 88,
        expected_close_date: getFutureDate(65),
        estimated_completion_date: getFutureDate(65),
        notes: 'UK fintech startup. FCA compliance requirements. Fast-track implementation.',
        contact_name: 'Emma Thompson',
        contact_email: 'e.thompson@fintechlondon.co.uk',
        contact_phone: '+44 20 7418 8000',
        last_contact_date: getTodayISO(),
        next_action: 'Compliance review meeting',
        company_id: 28,
        assigned_to: 9999,
        created_at: '2025-12-12T11:00:00Z',
        updated_at: new Date().toISOString()
      },

      // Barcelona Innovation Hub (company_id: 29)
      {
        id: 39,
        name: 'Smart City IoT Platform',
        address: 'Carrer de Badajoz 97, Barcelona, 08018, Spain',
        latitude: 41.4036,
        longitude: 2.1964,
        status: 'warm',
        revenue: 195000,
        probability_coefficient: 68,
        expected_close_date: getFutureDate(135),
        estimated_completion_date: getFutureDate(135),
        notes: 'Barcelona smart city initiative. Public-private partnership. Procurement phase.',
        contact_name: 'Carlos Rodriguez',
        contact_email: 'c.rodriguez@bcn-innovation.es',
        contact_phone: '+34 93 256 30 00',
        last_contact_date: getTodayISO(),
        next_action: 'Tender proposal submission',
        company_id: 29,
        assigned_to: 9999,
        created_at: '2025-12-18T14:00:00Z',
        updated_at: new Date().toISOString()
      },

      // Milano Fashion Tech (company_id: 30)
      {
        id: 40,
        name: 'Luxury Retail CRM Solution',
        address: 'Via Tortona 27, Milan, 20144, Italy',
        latitude: 45.4511,
        longitude: 9.1652,
        status: 'warm',
        revenue: 165000,
        probability_coefficient: 65,
        expected_close_date: getFutureDate(155),
        estimated_completion_date: getFutureDate(155),
        notes: 'Italian luxury fashion company. Omnichannel retail focus. Brand requirements.',
        contact_name: 'Alessandra Rossi',
        contact_email: 'a.rossi@milanofashion.it',
        contact_phone: '+39 02 4817 0000',
        last_contact_date: getTodayISO(),
        next_action: 'Brand customization demo',
        company_id: 30,
        assigned_to: 9999,
        created_at: '2025-12-20T09:00:00Z',
        updated_at: new Date().toISOString()
      },

      // Amsterdam HealthTech (company_id: 31)
      {
        id: 41,
        name: 'GDPR-Compliant Patient Management System',
        address: 'Strawinskylaan 3051, Amsterdam, 1077 ZX, Netherlands',
        latitude: 52.3376,
        longitude: 4.8740,
        status: 'hot',
        revenue: 240000,
        probability_coefficient: 82,
        expected_close_date: getFutureDate(75),
        estimated_completion_date: getFutureDate(75),
        notes: 'Dutch healthcare provider network. GDPR compliance critical. Strong interest.',
        contact_name: 'Pieter van den Berg',
        contact_email: 'p.vandenberg@ams-health.nl',
        contact_phone: '+31 20 570 5000',
        last_contact_date: getTodayISO(),
        next_action: 'GDPR compliance verification',
        company_id: 31,
        assigned_to: 9999,
        created_at: '2025-12-22T10:00:00Z',
        updated_at: new Date().toISOString()
      },

      // Zurich FinServe AG (company_id: 32)
      {
        id: 42,
        name: 'Private Banking Digital Transformation',
        address: 'Paradeplatz 8, Zurich, 8001, Switzerland',
        latitude: 47.3691,
        longitude: 8.5397,
        status: 'warm',
        revenue: 580000,
        probability_coefficient: 70,
        expected_close_date: getFutureDate(180),
        estimated_completion_date: getFutureDate(180),
        notes: 'Swiss private bank. High-security requirements. Long sales cycle expected.',
        contact_name: 'Hans Zimmermann',
        contact_email: 'h.zimmermann@zurich-finserve.ch',
        contact_phone: '+41 44 234 1111',
        last_contact_date: getTodayISO(),
        next_action: 'Security audit presentation',
        company_id: 32,
        assigned_to: 9999,
        created_at: '2025-12-08T08:00:00Z',
        updated_at: new Date().toISOString()
      },

      // Nordic Energy Solutions (company_id: 33)
      {
        id: 43,
        name: 'Wind Farm Management Platform',
        address: 'Kalvebod Brygge 45, Copenhagen, 1560, Denmark',
        latitude: 55.6713,
        longitude: 12.5695,
        status: 'recurring',
        revenue: 155000,
        probability_coefficient: 92,
        recurrence_months: 12,
        expected_close_date: getFutureDate(95),
        next_followup_date: getFutureDate(460),
        notes: 'Danish renewable energy company. Annual contract renewal. Very satisfied.',
        contact_name: 'Lars Andersen',
        contact_email: 'l.andersen@nordic-energy.dk',
        contact_phone: '+45 33 45 60 00',
        last_contact_date: getTodayISO(),
        next_action: 'Renewal discussion',
        company_id: 33,
        assigned_to: 9999,
        created_at: '2025-02-15T09:00:00Z',
        updated_at: new Date().toISOString()
      },

      // Dublin Tech Innovators (company_id: 34)
      {
        id: 44,
        name: 'SaaS Platform Scaling Solution',
        address: 'Grand Canal Quay, Dublin 2, D02 H210, Ireland',
        latitude: 53.3382,
        longitude: -6.2397,
        status: 'warm',
        revenue: 125000,
        probability_coefficient: 63,
        expected_close_date: getFutureDate(125),
        estimated_completion_date: getFutureDate(125),
        notes: 'Irish SaaS company. Rapid growth phase. Infrastructure scaling needs.',
        contact_name: 'Siobhan O\'Connor',
        contact_email: 's.oconnor@dublin-tech.ie',
        contact_phone: '+353 1 234 5000',
        last_contact_date: getTodayISO(),
        next_action: 'Scaling architecture review',
        company_id: 34,
        assigned_to: 9999,
        created_at: '2025-12-28T11:00:00Z',
        updated_at: new Date().toISOString()
      },

      // Brussels EU Consulting (company_id: 35)
      {
        id: 45,
        name: 'Multi-Lingual Project Management Suite',
        address: 'Avenue Louise 480, Brussels, 1050, Belgium',
        latitude: 50.8263,
        longitude: 4.3617,
        status: 'cold',
        revenue: 98000,
        probability_coefficient: 48,
        expected_close_date: getFutureDate(220),
        estimated_completion_date: getFutureDate(220),
        notes: 'EU consulting firm. Multi-language support essential. Early exploratory phase.',
        contact_name: 'Marie Dupont',
        contact_email: 'm.dupont@eu-consulting.be',
        phone: '+32 2 505 1000',
        last_contact_date: getTodayISO(),
        next_action: 'Requirements gathering call',
        company_id: 35,
        assigned_to: 9999,
        created_at: '2026-01-05T13:00:00Z',
        updated_at: new Date().toISOString()
      },

      // DigiTech Industries France - 2nd opportunity (company_id: 26)
      {
        id: 46,
        name: 'Cloud Migration Services Package',
        address: '35 Rue Joseph Monier, Rueil-Malmaison, 92500, France',
        latitude: 48.8766,
        longitude: 2.1833,
        status: 'warm',
        revenue: 145000,
        probability_coefficient: 75,
        expected_close_date: getFutureDate(100),
        estimated_completion_date: getFutureDate(100),
        notes: 'Complementary cloud migration for legacy systems. Following main ERP project.',
        contact_name: 'Sophie Martin',
        contact_email: 's.martin@digitech-industries.fr',
        contact_phone: '+33 1 47 14 20 50',
        last_contact_date: getTodayISO(),
        next_action: 'Migration roadmap review',
        company_id: 26,
        assigned_to: 9999,
        created_at: '2026-01-10T14:00:00Z',
        updated_at: new Date().toISOString()
      },

      // AutoVision Systems GmbH - 2nd opportunity (company_id: 27)
      {
        id: 47,
        name: 'Quality Assurance Analytics Module',
        address: 'Petuelring 130, Munich, 80788, Germany',
        latitude: 48.1775,
        longitude: 11.5582,
        status: 'cold',
        revenue: 185000,
        probability_coefficient: 42,
        expected_close_date: getFutureDate(260),
        estimated_completion_date: getFutureDate(260),
        notes: 'Advanced QA analytics add-on. Interest expressed but timeline unclear.',
        contact_name: 'Sabine Weber',
        contact_email: 's.weber@autovision-systems.de',
        contact_phone: '+49 89 382 00 100',
        last_contact_date: getTodayISO(),
        next_action: 'Product demonstration',
        company_id: 27,
        assigned_to: 9999,
        created_at: '2026-01-12T09:00:00Z',
        updated_at: new Date().toISOString()
      }
    ];

    // Demo companies (35 companies - including European companies with addresses)
    demoCompanies.value = [
      { id: 1, name: 'TechVision Inc', industry: 'Enterprise Software', size: '50-200', website: 'www.techvision.com', address: '350 5th Avenue, New York, NY 10118', latitude: 40.7484, longitude: -73.9857, created_at: '2025-12-20T10:00:00Z' },
      { id: 2, name: 'InnovateSoft LLC', industry: 'SaaS Startup', size: '10-50', website: 'www.innovatesoft.com', address: '1 Market Street, San Francisco, CA 94105', latitude: 37.7938, longitude: -122.3953, created_at: '2025-12-10T09:00:00Z' },
      { id: 3, name: 'GlobalTech Solutions', industry: 'IT Consulting', size: '200-500', website: 'www.globaltech.com', address: '233 S Wacker Drive, Chicago, IL 60606', latitude: 41.8786, longitude: -87.6363, created_at: '2025-11-15T08:00:00Z' },
      { id: 4, name: 'CloudFirst Corp', industry: 'Cloud Services', size: '50-200', website: 'www.cloudfirst.com', address: '2001 Ross Avenue, Dallas, TX 75201', latitude: 32.7876, longitude: -96.7988, created_at: '2025-11-01T10:30:00Z' },
      { id: 5, name: 'DataDrive Systems', industry: 'Data Analytics', size: '10-50', website: 'www.datadrive.com', address: '1100 Peachtree Street NE, Atlanta, GA 30309', latitude: 33.7866, longitude: -84.3838, created_at: '2025-12-05T14:00:00Z' },
      { id: 6, name: 'Apex Industries', industry: 'Manufacturing', size: '500+', website: 'www.apexind.com', address: '200 Clarendon Street, Boston, MA 02116', latitude: 42.3495, longitude: -71.0754, created_at: '2026-01-03T09:00:00Z' },
      { id: 7, name: 'NextGen Technologies', industry: 'Software Development', size: '50-200', website: 'www.nextgentech.com', address: '1918 8th Avenue, Seattle, WA 98101', latitude: 47.6154, longitude: -122.3371, created_at: '2025-01-15T11:00:00Z' },
      { id: 8, name: 'FinTech Solutions Group', industry: 'Financial Technology', size: '200-500', website: 'www.fintechsg.com', address: '1301 Fannin Street, Houston, TX 77002', latitude: 29.7536, longitude: -95.3675, created_at: '2025-11-20T08:30:00Z' },
      { id: 9, name: 'MediCare Plus', industry: 'Healthcare', size: '200-500', website: 'www.medicareplus.com', address: '1600 JFK Boulevard, Philadelphia, PA 19103', latitude: 39.9538, longitude: -75.1677, created_at: '2025-12-15T13:00:00Z' },
      { id: 10, name: 'RetailMax Corporation', industry: 'Retail', size: '500+', website: 'www.retailmax.com', address: '11921 Rockville Pike, Rockville, MD 20852', latitude: 39.0595, longitude: -77.1212, created_at: '2026-01-07T11:00:00Z' },
      { id: 11, name: 'EduTech Solutions', industry: 'Education Technology', size: '50-200', website: 'www.edutech.com', address: '98 San Jacinto Boulevard, Austin, TX 78701', latitude: 30.2688, longitude: -97.7425, created_at: '2025-12-01T09:30:00Z' },
      { id: 12, name: 'GreenEnergy Corp', industry: 'Renewable Energy', size: '200-500', website: 'www.greenenergy.com', address: '1999 Broadway, Denver, CO 80202', latitude: 39.7475, longitude: -104.9888, created_at: '2025-11-25T10:00:00Z' },
      { id: 13, name: 'LogiFlow Systems', industry: 'Logistics', size: '50-200', website: 'www.logiflow.com', address: '1200 Smith Street, Houston, TX 77002', latitude: 29.7520, longitude: -95.3688, created_at: '2026-01-04T14:00:00Z' },
      { id: 14, name: 'DesignWorks Studio', industry: 'Creative Agency', size: '10-50', website: 'www.designworks.com', address: '301 Congress Avenue, Austin, TX 78701', latitude: 30.2649, longitude: -97.7426, created_at: '2025-12-18T11:00:00Z' },
      { id: 15, name: 'SecureNet Inc', industry: 'Cybersecurity', size: '50-200', website: 'www.securenet.com', address: '1455 Market Street, San Francisco, CA 94103', latitude: 37.7756, longitude: -122.4177, created_at: '2025-10-20T09:00:00Z' },
      { id: 16, name: 'FoodChain Distributors', industry: 'Food Distribution', size: '200-500', website: 'www.foodchain.com', address: '200 E Randolph Street, Chicago, IL 60601', latitude: 41.8848, longitude: -87.6213, created_at: '2026-01-05T15:00:00Z' },
      { id: 17, name: 'AutoTech Industries', industry: 'Automotive', size: '500+', website: 'www.autotech.com', address: '100 Renaissance Center, Detroit, MI 48243', latitude: 42.3293, longitude: -83.0398, created_at: '2025-11-10T10:00:00Z' },
      { id: 18, name: 'CloudStream Media', industry: 'Media Streaming', size: '50-200', website: 'www.cloudstream.com', address: '5800 Sunset Boulevard, Los Angeles, CA 90028', latitude: 34.0979, longitude: -118.3265, created_at: '2024-02-10T09:00:00Z' },
      { id: 19, name: 'PropTech Ventures', industry: 'Real Estate Technology', size: '10-50', website: 'www.proptech.com', address: '1 World Trade Center, New York, NY 10007', latitude: 40.7127, longitude: -74.0134, created_at: '2025-12-08T13:00:00Z' },
      { id: 20, name: 'HealthFirst Analytics', industry: 'Healthcare Analytics', size: '200-500', website: 'www.healthfirst.com', address: '100 Federal Street, Boston, MA 02110', latitude: 42.3554, longitude: -71.0532, created_at: '2025-11-05T08:00:00Z' },
      { id: 21, name: 'BioMed Research Corp', industry: 'Biotechnology', size: '200-500', website: 'www.biomed.com', address: '9500 Gilman Drive, La Jolla, CA 92093', latitude: 32.8801, longitude: -117.2340, created_at: '2025-12-20T14:00:00Z' },
      { id: 22, name: 'TechStart Accelerator', industry: 'Startup Accelerator', size: '10-50', website: 'www.techstart.com', address: '535 Mission Street, San Francisco, CA 94105', latitude: 37.7887, longitude: -122.3980, created_at: '2025-12-28T09:00:00Z' },
      { id: 23, name: 'Maritime Logistics Inc', industry: 'Shipping & Logistics', size: '200-500', website: 'www.maritime.com', address: '1000 2nd Avenue, Seattle, WA 98104', latitude: 47.6050, longitude: -122.3346, created_at: '2026-01-08T10:00:00Z' },
      { id: 24, name: 'SmartHome Solutions', industry: 'IoT Technology', size: '50-200', website: 'www.smarthome.com', address: '2600 Campus Drive, San Mateo, CA 94403', latitude: 37.5376, longitude: -122.2995, created_at: '2025-06-30T11:00:00Z' },
      { id: 25, name: 'ConsultPro Group', industry: 'Management Consulting', size: '200-500', website: 'www.consultpro.com', address: '1166 Avenue of the Americas, New York, NY 10036', latitude: 40.7576, longitude: -73.9810, created_at: '2025-12-18T13:00:00Z' },
      
      // European Companies
      { id: 26, name: 'DigiTech Industries France', industry: 'Industrial Automation', size: '500+', website: 'www.digitech-industries.fr', address: '35 Rue Joseph Monier, Rueil-Malmaison, 92500, France', latitude: 48.8766, longitude: 2.1833, created_at: '2025-11-28T09:00:00Z' },
      { id: 27, name: 'AutoVision Systems GmbH', industry: 'Automotive Technology', size: '500+', website: 'www.autovision-systems.de', address: 'Petuelring 130, Munich, 80788, Germany', latitude: 48.1775, longitude: 11.5582, created_at: '2025-12-05T10:00:00Z' },
      { id: 28, name: 'FinTech London Ltd', industry: 'Financial Technology', size: '50-200', website: 'www.fintechlondon.co.uk', address: '1 Canada Square, Canary Wharf, London, E14 5AB, UK', latitude: 51.5049, longitude: -0.0197, created_at: '2025-12-12T11:00:00Z' },
      { id: 29, name: 'Barcelona Innovation Hub', industry: 'Smart City Solutions', size: '200-500', website: 'www.bcn-innovation.es', address: 'Avinguda Diagonal 682, Barcelona, 08034, Spain', latitude: 41.3954, longitude: 2.1408, created_at: '2025-12-18T14:00:00Z' },
      { id: 30, name: 'Milano Fashion Tech', industry: 'Luxury Retail', size: '50-200', website: 'www.milanofashion.it', address: 'Via Montenapoleone 8, Milan, 20121, Italy', latitude: 45.4685, longitude: 9.1943, created_at: '2025-12-20T09:00:00Z' },
      { id: 31, name: 'Amsterdam HealthTech', industry: 'Healthcare Technology', size: '200-500', website: 'www.ams-health.nl', address: 'Gustav Mahlerlaan 10, Amsterdam, 1082 PP, Netherlands', latitude: 52.3380, longitude: 4.8720, created_at: '2025-12-22T10:00:00Z' },
      { id: 32, name: 'Zurich FinServe AG', industry: 'Private Banking', size: '500+', website: 'www.zurich-finserve.ch', address: 'Bahnhofstrasse 45, Zurich, 8001, Switzerland', latitude: 47.3709, longitude: 8.5400, created_at: '2025-12-08T08:00:00Z' },
      { id: 33, name: 'Nordic Energy Solutions', industry: 'Renewable Energy', size: '200-500', website: 'www.nordic-energy.dk', address: 'Dampfaergevej 27-29, Copenhagen, 2100, Denmark', latitude: 55.7030, longitude: 12.5608, created_at: '2025-02-15T09:00:00Z' },
      { id: 34, name: 'Dublin Tech Innovators', industry: 'SaaS Platform', size: '10-50', website: 'www.dublin-tech.ie', address: 'Grand Canal Quay, Dublin 2, D02 H210, Ireland', latitude: 53.3382, longitude: -6.2397, created_at: '2025-12-28T11:00:00Z' },
      { id: 35, name: 'Brussels EU Consulting', industry: 'EU Consulting', size: '50-200', website: 'www.eu-consulting.be', address: 'Avenue Louise 480, Brussels, 1050, Belgium', latitude: 50.8263, longitude: 4.3617, created_at: '2026-01-05T13:00:00Z' }
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
      { id: 59, company_id: 25, name: 'Robert Johnson', email: 'r.johnson@consultpro.com', phone: '+1 (312) 555-2502', position: 'VP of Client Services', is_primary: false, created_at: '2025-12-18T13:10:00Z' },

      // EUROPEAN CONTACTS

      // DigiTech Industries France (company_id: 26)
      { id: 60, company_id: 26, name: 'Jean-Pierre Dubois', email: 'jp.dubois@digitech-industries.fr', phone: '+33 1 47 14 20 00', position: 'Directeur des Systèmes d\'Information', is_primary: true, created_at: '2025-11-28T09:00:00Z' },
      { id: 61, company_id: 26, name: 'Sophie Martin', email: 's.martin@digitech-industries.fr', phone: '+33 1 47 14 20 50', position: 'Responsable Transformation Digitale', is_primary: false, created_at: '2025-11-28T09:05:00Z' },
      { id: 62, company_id: 26, name: 'Alain Rousseau', email: 'a.rousseau@digitech-industries.fr', phone: '+33 1 47 14 20 75', position: 'PDG', is_primary: false, created_at: '2025-11-28T09:10:00Z' },

      // AutoVision Systems GmbH (company_id: 27)
      { id: 63, company_id: 27, name: 'Dr. Klaus Mueller', email: 'k.mueller@autovision-systems.de', phone: '+49 89 382 00', position: 'Head of Digital Manufacturing', is_primary: true, created_at: '2025-12-05T10:00:00Z' },
      { id: 64, company_id: 27, name: 'Sabine Weber', email: 's.weber@autovision-systems.de', phone: '+49 89 382 00 100', position: 'VP of Quality Assurance', is_primary: false, created_at: '2025-12-05T10:05:00Z' },
      { id: 65, company_id: 27, name: 'Friedrich Schmidt', email: 'f.schmidt@autovision-systems.de', phone: '+49 89 382 00 200', position: 'CIO', is_primary: false, created_at: '2025-12-05T10:10:00Z' },

      // FinTech London Ltd (company_id: 28)
      { id: 66, company_id: 28, name: 'Emma Thompson', email: 'e.thompson@fintechlondon.co.uk', phone: '+44 20 7418 8000', position: 'Chief Compliance Officer', is_primary: true, created_at: '2025-12-12T11:00:00Z' },
      { id: 67, company_id: 28, name: 'Oliver James', email: 'o.james@fintechlondon.co.uk', phone: '+44 20 7418 8050', position: 'CEO', is_primary: false, created_at: '2025-12-12T11:05:00Z' },
      { id: 68, company_id: 28, name: 'Charlotte Brown', email: 'c.brown@fintechlondon.co.uk', phone: '+44 20 7418 8100', position: 'CTO', is_primary: false, created_at: '2025-12-12T11:10:00Z' },

      // Barcelona Innovation Hub (company_id: 29)
      { id: 69, company_id: 29, name: 'Carlos Rodriguez', email: 'c.rodriguez@bcn-innovation.es', phone: '+34 93 256 30 00', position: 'Director de Innovación', is_primary: true, created_at: '2025-12-18T14:00:00Z' },
      { id: 70, company_id: 29, name: 'Isabel Garcia', email: 'i.garcia@bcn-innovation.es', phone: '+34 93 256 30 50', position: 'Jefa de Proyectos Smart City', is_primary: false, created_at: '2025-12-18T14:05:00Z' },

      // Milano Fashion Tech (company_id: 30)
      { id: 71, company_id: 30, name: 'Alessandra Rossi', email: 'a.rossi@milanofashion.it', phone: '+39 02 4817 0000', position: 'Direttore Digitale', is_primary: true, created_at: '2025-12-20T09:00:00Z' },
      { id: 72, company_id: 30, name: 'Marco Bianchi', email: 'm.bianchi@milanofashion.it', phone: '+39 02 4817 0050', position: 'CEO', is_primary: false, created_at: '2025-12-20T09:05:00Z' },
      { id: 73, company_id: 30, name: 'Lucia Ferrari', email: 'l.ferrari@milanofashion.it', phone: '+39 02 4817 0100', position: 'VP of Customer Experience', is_primary: false, created_at: '2025-12-20T09:10:00Z' },

      // Amsterdam HealthTech (company_id: 31)
      { id: 74, company_id: 31, name: 'Pieter van den Berg', email: 'p.vandenberg@ams-health.nl', phone: '+31 20 570 5000', position: 'Director of IT', is_primary: true, created_at: '2025-12-22T10:00:00Z' },
      { id: 75, company_id: 31, name: 'Anna de Vries', email: 'a.devries@ams-health.nl', phone: '+31 20 570 5050', position: 'Chief Medical Officer', is_primary: false, created_at: '2025-12-22T10:05:00Z' },
      { id: 76, company_id: 31, name: 'Jan Bakker', email: 'j.bakker@ams-health.nl', phone: '+31 20 570 5100', position: 'CEO', is_primary: false, created_at: '2025-12-22T10:10:00Z' },

      // Zurich FinServe AG (company_id: 32)
      { id: 77, company_id: 32, name: 'Hans Zimmermann', email: 'h.zimmermann@zurich-finserve.ch', phone: '+41 44 234 1111', position: 'Head of Private Banking', is_primary: true, created_at: '2025-12-08T08:00:00Z' },
      { id: 78, company_id: 32, name: 'Ursula Meier', email: 'u.meier@zurich-finserve.ch', phone: '+41 44 234 1150', position: 'Chief Security Officer', is_primary: false, created_at: '2025-12-08T08:05:00Z' },
      { id: 79, company_id: 32, name: 'Stefan Keller', email: 's.keller@zurich-finserve.ch', phone: '+41 44 234 1200', position: 'Managing Director', is_primary: false, created_at: '2025-12-08T08:10:00Z' },

      // Nordic Energy Solutions (company_id: 33)
      { id: 80, company_id: 33, name: 'Lars Andersen', email: 'l.andersen@nordic-energy.dk', phone: '+45 33 45 60 00', position: 'VP of Operations', is_primary: true, created_at: '2025-02-15T09:00:00Z' },
      { id: 81, company_id: 33, name: 'Mette Jensen', email: 'm.jensen@nordic-energy.dk', phone: '+45 33 45 60 50', position: 'CTO', is_primary: false, created_at: '2025-02-15T09:05:00Z' },

      // Dublin Tech Innovators (company_id: 34)
      { id: 82, company_id: 34, name: 'Siobhan O\'Connor', email: 's.oconnor@dublin-tech.ie', phone: '+353 1 234 5000', position: 'CEO', is_primary: true, created_at: '2025-12-28T11:00:00Z' },
      { id: 83, company_id: 34, name: 'Liam Murphy', email: 'l.murphy@dublin-tech.ie', phone: '+353 1 234 5050', position: 'Head of Engineering', is_primary: false, created_at: '2025-12-28T11:05:00Z' },
      { id: 84, company_id: 34, name: 'Aoife Kelly', email: 'a.kelly@dublin-tech.ie', phone: '+353 1 234 5100', position: 'VP of Product', is_primary: false, created_at: '2025-12-28T11:10:00Z' },

      // Brussels EU Consulting (company_id: 35)
      { id: 85, company_id: 35, name: 'Marie Dupont', email: 'm.dupont@eu-consulting.be', phone: '+32 2 505 1000', position: 'Directrice Générale', is_primary: true, created_at: '2026-01-05T13:00:00Z' },
      { id: 86, company_id: 35, name: 'Philippe Laurent', email: 'p.laurent@eu-consulting.be', phone: '+32 2 505 1050', position: 'Responsable IT', is_primary: false, created_at: '2026-01-05T13:05:00Z' }
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
    // Enrichir chaque prospect avec le nom, adresse et coordonnées de la company
    return demoProspects.value.map(prospect => {
      if (prospect.company_id) {
        const company = demoCompanies.value.find(c => c.id === prospect.company_id);
        if (company) {
          return {
            ...prospect,
            company: company.name,
            address: company.address || prospect.address,
            latitude: company.latitude || prospect.latitude,
            longitude: company.longitude || prospect.longitude
          };
        }
      }
      return prospect;
    });
  }

  function getDemoProspectById(id) {
    const prospect = demoProspects.value.find(p => p.id === id);
    if (!prospect) return null;
    
    // Enrichir avec le nom, adresse et coordonnées de la company
    if (prospect.company_id) {
      const company = demoCompanies.value.find(c => c.id === prospect.company_id);
      if (company) {
        return {
          ...prospect,
          company: company.name,
          address: company.address || prospect.address,
          latitude: company.latitude || prospect.latitude,
          longitude: company.longitude || prospect.longitude
        };
      }
    }
    return prospect;
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
    
    // Retourner avec le nom, adresse et coordonnées de company enrichis
    if (newProspect.company_id) {
      const company = demoCompanies.value.find(c => c.id === newProspect.company_id);
      if (company) {
        return {
          ...newProspect,
          company: company.name,
          address: company.address || newProspect.address,
          latitude: company.latitude || newProspect.latitude,
          longitude: company.longitude || newProspect.longitude
        };
      }
    }
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
      
      const updatedProspect = demoProspects.value[index];
      
      // Retourner avec le nom, adresse et coordonnées de company enrichis
      if (updatedProspect.company_id) {
        const company = demoCompanies.value.find(c => c.id === updatedProspect.company_id);
        if (company) {
          return {
            ...updatedProspect,
            company: company.name,
            address: company.address || updatedProspect.address,
            latitude: company.latitude || updatedProspect.latitude,
            longitude: company.longitude || updatedProspect.longitude
          };
        }
      }
      return updatedProspect;
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
    // Attach contacts to each company
    return demoCompanies.value.map(company => {
      const companyContacts = demoContacts.value.filter(c => c.company_id === company.id);
      return { ...company, contacts: companyContacts };
    });
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
    const company = demoCompanies.value.find(c => c.id === id);
    if (!company) return null;
    
    // Attach contacts to company
    const companyContacts = demoContacts.value.filter(c => c.company_id === id);
    return { ...company, contacts: companyContacts };
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
