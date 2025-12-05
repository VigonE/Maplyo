<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestion des Entreprises</h1>
          <p class="text-sm text-gray-500 mt-1">Gérez vos entreprises et leurs contacts</p>
        </div>
        <button
          @click="openCreateCompanyModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle Entreprise
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Chargement...</p>
      </div>
    </div>

    <!-- Companies List -->
    <div v-else class="flex-1 overflow-auto p-6">
      <div v-if="companies.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mt-4">Aucune entreprise</h3>
        <p class="text-gray-500 mt-2">Créez votre première entreprise pour commencer</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="company in companies"
          :key="company.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="selectCompany(company)"
        >
          <!-- Company Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ company.name }}</h3>
              <p v-if="company.industry" class="text-sm text-gray-500 mt-1">{{ company.industry }}</p>
            </div>
            <div class="flex gap-1">
              <button
                @click.stop="editCompany(company)"
                class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Modifier"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click.stop="deleteCompany(company)"
                class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Supprimer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Company Info -->
          <div class="space-y-2 text-sm">
            <div v-if="company.email" class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{{ company.email }}</span>
            </div>
            <div v-if="company.phone" class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{{ company.phone }}</span>
            </div>
            <div v-if="company.website" class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a :href="company.website" target="_blank" class="text-blue-600 hover:underline">{{ company.website }}</a>
            </div>
            <div v-if="company.address" class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ company.address }}</span>
            </div>
          </div>

          <!-- Contacts Count -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">
                {{ company.contacts?.length || 0 }} contact(s)
              </span>
              <button
                @click.stop="manageContacts(company)"
                class="text-blue-600 hover:text-blue-700 font-medium"
              >
                Gérer les contacts →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Modal -->
    <div v-if="showCompanyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingCompany ? 'Modifier l\'entreprise' : 'Nouvelle entreprise' }}
          </h2>
          <button @click="closeCompanyModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveCompany" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
            <input
              v-model="companyForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom de l'entreprise"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
              <input
                v-model="companyForm.industry"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Technologie, Finance..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site web</label>
              <input
                v-model="companyForm.website"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="companyForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@entreprise.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                v-model="companyForm.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              v-model="companyForm.address"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Adresse complète"
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                v-model="companyForm.city"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ville"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
              <input
                v-model="companyForm.postal_code"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="75001"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input
                v-model="companyForm.country"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="France"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              v-model="companyForm.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notes supplémentaires..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeCompanyModal"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Contacts Management Modal -->
    <div v-if="showContactsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Contacts de {{ selectedCompany?.name }}</h2>
            <p class="text-sm text-gray-500 mt-1">Gérez les contacts associés à cette entreprise</p>
          </div>
          <button @click="closeContactsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <!-- Add Contact Form -->
          <div class="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Ajouter un contact</h3>
            <form @submit.prevent="addContact" class="grid grid-cols-2 gap-3">
              <input
                v-model="contactForm.first_name"
                type="text"
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Prénom *"
              />
              <input
                v-model="contactForm.last_name"
                type="text"
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom *"
              />
              <input
                v-model="contactForm.email"
                type="email"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email"
              />
              <input
                v-model="contactForm.phone"
                type="tel"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Téléphone"
              />
              <input
                v-model="contactForm.position"
                type="text"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Poste"
              />
              <input
                v-model="contactForm.department"
                type="text"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Département"
              />
              <div class="col-span-2">
                <button
                  type="submit"
                  :disabled="saving"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ saving ? 'Ajout...' : 'Ajouter le contact' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Contacts List -->
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-900">Contacts associés ({{ selectedCompany?.contacts?.length || 0 }})</h3>
            
            <div v-if="!selectedCompany?.contacts || selectedCompany.contacts.length === 0" class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Aucun contact associé</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="contact in selectedCompany.contacts"
                :key="contact.id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="font-semibold text-gray-900">{{ contact.first_name }} {{ contact.last_name }}</h4>
                      <span v-if="contact.is_primary" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Principal
                      </span>
                    </div>
                    <p v-if="contact.position" class="text-sm text-gray-600 mt-1">{{ contact.position }}</p>
                    <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                      <span v-if="contact.email" class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {{ contact.email }}
                      </span>
                      <span v-if="contact.phone" class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {{ contact.phone }}
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-1 ml-4">
                    <button
                      @click="togglePrimaryContact(contact)"
                      :class="[
                        'p-2 rounded transition-colors',
                        contact.is_primary
                          ? 'text-blue-600 hover:bg-blue-50'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      ]"
                      title="Contact principal"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                    <button
                      @click="removeContact(contact)"
                      class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Retirer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const companies = ref([]);
const loading = ref(false);
const saving = ref(false);
const showCompanyModal = ref(false);
const showContactsModal = ref(false);
const editingCompany = ref(null);
const selectedCompany = ref(null);

const companyForm = ref({
  name: '',
  industry: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  country: '',
  postal_code: '',
  notes: ''
});

const contactForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  mobile: '',
  position: '',
  department: '',
  notes: ''
});

onMounted(() => {
  loadCompanies();
});

async function loadCompanies() {
  try {
    loading.value = true;
    companies.value = await api.getCompanies();
  } catch (error) {
    console.error('Erreur lors du chargement des entreprises:', error);
    alert('Erreur lors du chargement des entreprises');
  } finally {
    loading.value = false;
  }
}

function openCreateCompanyModal() {
  editingCompany.value = null;
  companyForm.value = {
    name: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    notes: ''
  };
  showCompanyModal.value = true;
}

function editCompany(company) {
  editingCompany.value = company;
  companyForm.value = { ...company };
  showCompanyModal.value = true;
}

function closeCompanyModal() {
  showCompanyModal.value = false;
  editingCompany.value = null;
}

async function saveCompany() {
  try {
    saving.value = true;
    if (editingCompany.value) {
      await api.updateCompany(editingCompany.value.id, companyForm.value);
    } else {
      await api.createCompany(companyForm.value);
    }
    await loadCompanies();
    closeCompanyModal();
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    alert('Erreur lors de l\'enregistrement de l\'entreprise');
  } finally {
    saving.value = false;
  }
}

async function deleteCompany(company) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${company.name}" ?`)) {
    return;
  }
  
  try {
    await api.deleteCompany(company.id);
    await loadCompanies();
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    alert('Erreur lors de la suppression de l\'entreprise');
  }
}

function selectCompany(company) {
  // Optional: navigate to company details or open modal
}

async function manageContacts(company) {
  selectedCompany.value = company;
  contactForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    position: '',
    department: '',
    notes: ''
  };
  showContactsModal.value = true;
}

function closeContactsModal() {
  showContactsModal.value = false;
  selectedCompany.value = null;
}

async function addContact() {
  try {
    saving.value = true;
    const newContact = await api.createContact(contactForm.value);
    await api.linkContactToCompany(selectedCompany.value.id, newContact.id);
    
    // Reload company details
    const updatedCompany = await api.getCompany(selectedCompany.value.id);
    selectedCompany.value = updatedCompany;
    
    // Update in companies list
    const index = companies.value.findIndex(c => c.id === selectedCompany.value.id);
    if (index !== -1) {
      companies.value[index] = updatedCompany;
    }
    
    // Reset form
    contactForm.value = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile: '',
      position: '',
      department: '',
      notes: ''
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du contact:', error);
    alert('Erreur lors de l\'ajout du contact');
  } finally {
    saving.value = false;
  }
}

async function removeContact(contact) {
  if (!confirm(`Retirer "${contact.first_name} ${contact.last_name}" de cette entreprise ?`)) {
    return;
  }
  
  try {
    await api.unlinkContactFromCompany(selectedCompany.value.id, contact.id);
    
    // Reload company details
    const updatedCompany = await api.getCompany(selectedCompany.value.id);
    selectedCompany.value = updatedCompany;
    
    // Update in companies list
    const index = companies.value.findIndex(c => c.id === selectedCompany.value.id);
    if (index !== -1) {
      companies.value[index] = updatedCompany;
    }
  } catch (error) {
    console.error('Erreur lors du retrait du contact:', error);
    alert('Erreur lors du retrait du contact');
  }
}

async function togglePrimaryContact(contact) {
  try {
    await api.setPrimaryContact(selectedCompany.value.id, contact.id, !contact.is_primary);
    
    // Reload company details
    const updatedCompany = await api.getCompany(selectedCompany.value.id);
    selectedCompany.value = updatedCompany;
    
    // Update in companies list
    const index = companies.value.findIndex(c => c.id === selectedCompany.value.id);
    if (index !== -1) {
      companies.value[index] = updatedCompany;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contact principal:', error);
    alert('Erreur lors de la mise à jour du contact principal');
  }
}
</script>
