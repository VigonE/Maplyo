<template>
  <!-- Modal Overlay -->
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Company Management</h2>
          <p class="text-sm text-gray-500 mt-1">Manage your companies and their contacts</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="openCreateCompanyModal"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Company
          </button>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 p-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search companies by name, industry, email..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>

      <!-- Companies List -->
      <div v-else class="flex-1 overflow-auto p-6">
        <div v-if="filteredCompanies.length === 0 && searchQuery" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mt-4">No results found</h3>
          <p class="text-gray-500 mt-2">Try different keywords</p>
        </div>

        <div v-else-if="companies.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mt-4">No companies</h3>
          <p class="text-gray-500 mt-2">Create your first company to get started</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="company in filteredCompanies"
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
                  title="Edit"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click.stop="deleteCompany(company)"
                  class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
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
                <a :href="company.website" target="_blank" @click.stop class="text-blue-600 hover:underline">{{ company.website }}</a>
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
                  Manage contacts →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Edit Modal -->
    <div v-if="showCompanyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="closeCompanyModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingCompany ? 'Edit Company' : 'New Company' }}
          </h2>
          <button @click="closeCompanyModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveCompany" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input
              v-model="companyForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Company name"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                v-model="companyForm.industry"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Technology, Finance..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                v-model="companyForm.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              v-model="companyForm.address"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Full address"
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                v-model="companyForm.city"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                v-model="companyForm.postal_code"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12345"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                v-model="companyForm.country"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="USA"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              v-model="companyForm.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeCompanyModal"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Contacts Management Modal -->
    <div v-if="showContactsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="closeContactsModal">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Contacts for {{ selectedCompany?.name }}</h2>
            <p class="text-sm text-gray-500 mt-1">Manage contacts associated with this company</p>
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
            <h3 class="font-semibold text-gray-900 mb-3">Add a contact</h3>
            <form @submit.prevent="addContact" class="grid grid-cols-2 gap-3">
              <input
                v-model="contactForm.first_name"
                type="text"
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First Name *"
              />
              <input
                v-model="contactForm.last_name"
                type="text"
                required
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last Name *"
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
                placeholder="Phone"
              />
              <input
                v-model="contactForm.position"
                type="text"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Position"
              />
              <input
                v-model="contactForm.department"
                type="text"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Department"
              />
              <div class="col-span-2">
                <button
                  type="submit"
                  :disabled="saving"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ saving ? 'Adding...' : 'Add Contact' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Contacts List -->
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-900">Associated Contacts ({{ selectedCompany?.contacts?.length || 0 }})</h3>
            
            <div v-if="!selectedCompany?.contacts || selectedCompany.contacts.length === 0" class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No associated contacts</p>
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
                        Primary
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
                      @click="editContact(contact)"
                      class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="togglePrimaryContact(contact)"
                      :class="[
                        'p-2 rounded transition-colors',
                        contact.is_primary
                          ? 'text-blue-600 hover:bg-blue-50'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      ]"
                      title="Primary contact"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                    <button
                      @click="removeContact(contact)"
                      class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove"
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

    <!-- Company Details Modal -->
    <div v-if="showCompanyDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="closeCompanyDetailsModal">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h2 class="text-2xl font-bold">{{ selectedCompany?.name }}</h2>
              <p v-if="selectedCompany?.industry" class="text-blue-100 mt-1">{{ selectedCompany.industry }}</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="editCompany(selectedCompany); closeCompanyDetailsModal();"
                class="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                title="Edit"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="closeCompanyDetailsModal"
                class="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Company Information -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Contact Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Information
              </h3>
              <div class="space-y-3">
                <div v-if="selectedCompany?.email">
                  <label class="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                  <p class="text-gray-900">{{ selectedCompany.email }}</p>
                </div>
                <div v-if="selectedCompany?.phone">
                  <label class="text-xs text-gray-500 uppercase tracking-wide">Phone</label>
                  <p class="text-gray-900">{{ selectedCompany.phone }}</p>
                </div>
                <div v-if="selectedCompany?.website">
                  <label class="text-xs text-gray-500 uppercase tracking-wide">Website</label>
                  <a :href="selectedCompany.website" target="_blank" class="text-blue-600 hover:underline">
                    {{ selectedCompany.website }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Location Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </h3>
              <div class="space-y-3">
                <div v-if="selectedCompany?.address">
                  <label class="text-xs text-gray-500 uppercase tracking-wide">Address</label>
                  <p class="text-gray-900">{{ selectedCompany.address }}</p>
                </div>
                <div v-if="selectedCompany?.city || selectedCompany?.postal_code">
                  <label class="text-xs text-gray-500 uppercase tracking-wide">City</label>
                  <p class="text-gray-900">
                    {{ selectedCompany.city }}{{ selectedCompany.postal_code ? ', ' + selectedCompany.postal_code : '' }}
                  </p>
                </div>
                <div v-if="selectedCompany?.country">
                  <label class="text-xs text-gray-500 uppercase tracking-wide">Country</label>
                  <p class="text-gray-900">{{ selectedCompany.country }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedCompany?.notes" class="mt-6 bg-yellow-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Notes
            </h3>
            <p class="text-gray-700 whitespace-pre-wrap">{{ selectedCompany.notes }}</p>
          </div>

          <!-- Leads Section -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Leads ({{ companyProspects.length }})
              </h3>
            </div>

            <div v-if="companyProspects.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p class="text-gray-500">No leads associated with this company</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="prospect in companyProspects"
                :key="prospect.id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                @click="openProspectModal(prospect)"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full" :class="getStatusColor(prospect.status)"></div>
                      <h4 class="font-semibold text-gray-900 hover:text-blue-600">{{ prospect.name }}</h4>
                    </div>
                    <span class="inline-block text-xs mt-1 px-2 py-0.5 rounded-full" :class="getStatusBadge(prospect.status)">
                      {{ prospect.status?.toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="space-y-1 text-sm mt-3">
                  <div v-if="prospect.email" class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="truncate">{{ prospect.email }}</span>
                  </div>
                  <div v-if="prospect.phone" class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{{ prospect.phone }}</span>
                  </div>
                  <div v-if="prospect.revenue" class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>${{ prospect.revenue.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contacts Section -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Contacts ({{ selectedCompany?.contacts?.length || 0 }})
              </h3>
              <button
                @click="manageContacts(selectedCompany); closeCompanyDetailsModal();"
                class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Manage Contacts
              </button>
            </div>

            <div v-if="!selectedCompany?.contacts || selectedCompany.contacts.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-gray-500">No contacts associated with this company</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="contact in selectedCompany.contacts"
                :key="contact.id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="font-semibold text-gray-900">{{ contact.first_name }} {{ contact.last_name }}</h4>
                      <span v-if="contact.is_primary" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    </div>
                    <p v-if="contact.position" class="text-sm text-gray-600 mt-1">{{ contact.position }}</p>
                    <p v-if="contact.department" class="text-xs text-gray-500">{{ contact.department }}</p>
                  </div>
                </div>
                <div class="space-y-1 text-sm">
                  <div v-if="contact.email" class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a :href="'mailto:' + contact.email" class="hover:text-blue-600">{{ contact.email }}</a>
                  </div>
                  <div v-if="contact.phone" class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a :href="'tel:' + contact.phone" class="hover:text-blue-600">{{ contact.phone }}</a>
                  </div>
                  <div v-if="contact.mobile" class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <a :href="'tel:' + contact.mobile" class="hover:text-blue-600">{{ contact.mobile }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Contact Modal -->
    <div v-if="showEditContactModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4" @click.self="closeEditContactModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Edit Contact</h2>
          <button @click="closeEditContactModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveContactEdit" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                v-model="contactForm.first_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="First Name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                v-model="contactForm.last_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="contactForm.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                v-model="contactForm.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input
                v-model="contactForm.mobile"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                v-model="contactForm.position"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Position"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                v-model="contactForm.department"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Department"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              v-model="contactForm.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="closeEditContactModal"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '../services/api';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  initialCompanyId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['close', 'open-prospect']);

const companies = ref([]);
const loading = ref(false);
const saving = ref(false);
const showCompanyModal = ref(false);
const showContactsModal = ref(false);
const showCompanyDetailsModal = ref(false);
const showEditContactModal = ref(false);
const editingCompany = ref(null);
const selectedCompany = ref(null);
const editingContact = ref(null);
const allProspects = ref([]);
const searchQuery = ref('');

// Computed pour filtrer les companies selon la recherche
const filteredCompanies = computed(() => {
  if (!searchQuery.value) {
    return companies.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return companies.value.filter(company => {
    return (
      company.name?.toLowerCase().includes(query) ||
      company.industry?.toLowerCase().includes(query) ||
      company.email?.toLowerCase().includes(query) ||
      company.phone?.toLowerCase().includes(query) ||
      company.address?.toLowerCase().includes(query) ||
      company.city?.toLowerCase().includes(query) ||
      company.country?.toLowerCase().includes(query)
    );
  });
});

// Computed pour filtrer les leads de la company sélectionnée
const companyProspects = computed(() => {
  if (!selectedCompany.value) return [];
  return allProspects.value.filter(p => p.company_id === selectedCompany.value.id);
});

// Fonctions pour gérer les statuts des leads
function getStatusColor(status) {
  const colors = {
    cold: 'bg-blue-500',
    warm: 'bg-orange-500',
    hot: 'bg-red-500',
    won: 'bg-green-500',
    lost: 'bg-gray-500',
    recurring: 'bg-purple-500'
  };
  return colors[status] || 'bg-gray-500';
}

function getStatusBadge(status) {
  const badges = {
    cold: 'bg-blue-100 text-blue-800',
    warm: 'bg-orange-100 text-orange-800',
    hot: 'bg-red-100 text-red-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-gray-100 text-gray-800',
    recurring: 'bg-purple-100 text-purple-800'
  };
  return badges[status] || 'bg-gray-100 text-gray-800';
}

function openProspectModal(prospect) {
  emit('open-prospect', prospect);
}

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

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    loadCompanies();
  }
});

async function loadCompanies() {
  try {
    loading.value = true;
    companies.value = await api.getCompanies();
  } catch (error) {
    console.error('Error loading companies:', error);
    alert('Error loading companies');
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  emit('close');
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
      // Émettre un événement global pour notifier les autres composants
      console.log('🏢 Company created, emitting companiesChanged event');
      window.dispatchEvent(new CustomEvent('companiesChanged'));
    }
    await loadCompanies();
    closeCompanyModal();
  } catch (error) {
    console.error('Error saving company:', error);
    alert('Error saving company');
  } finally {
    saving.value = false;
  }
}

async function deleteCompany(company) {
  if (!confirm(`Are you sure you want to delete "${company.name}"?`)) {
    return;
  }
  
  try {
    await api.deleteCompany(company.id);
    await loadCompanies();
  } catch (error) {
    console.error('Error deleting company:', error);
    alert('Error deleting company');
  }
}

async function selectCompany(company) {
  try {
    // Load full company details with contacts
    const fullCompany = await api.getCompany(company.id);
    selectedCompany.value = fullCompany;
    showCompanyDetailsModal.value = true;
  } catch (error) {
    console.error('Error loading company details:', error);
    alert('Error loading company details');
  }
}

// Auto-open company details when initialCompanyId is provided
watch(() => [props.isVisible, props.initialCompanyId], async ([visible, companyId]) => {
  if (visible && companyId) {
    await loadCompanies();
    await loadProspects();
    const company = companies.value.find(c => c.id === companyId);
    if (company) {
      await selectCompany(company);
    }
  }
});

watch(() => props.isVisible, async (visible) => {
  if (visible) {
    await loadCompanies();
    await loadProspects();
  }
});

// Recharger les prospects périodiquement quand la modal company details est ouverte
let prospectsRefreshInterval = null;

watch(showCompanyDetailsModal, (isOpen) => {
  if (isOpen) {
    // Rafraîchir toutes les 2 secondes quand la modal est ouverte
    prospectsRefreshInterval = setInterval(async () => {
      if (showCompanyDetailsModal.value && selectedCompany.value) {
        await loadProspects();
      }
    }, 2000);
  } else {
    // Nettoyer l'intervalle quand la modal se ferme
    if (prospectsRefreshInterval) {
      clearInterval(prospectsRefreshInterval);
      prospectsRefreshInterval = null;
    }
  }
});

async function loadProspects() {
  try {
    const response = await api.get('/prospects');
    allProspects.value = response.data || [];
  } catch (error) {
    console.error('Error loading prospects:', error);
  }
}

function closeCompanyDetailsModal() {
  showCompanyDetailsModal.value = false;
  selectedCompany.value = null;
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
    console.error('Error adding contact:', error);
    alert('Error adding contact');
  } finally {
    saving.value = false;
  }
}

function editContact(contact) {
  editingContact.value = contact;
  contactForm.value = {
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email || '',
    phone: contact.phone || '',
    mobile: contact.mobile || '',
    position: contact.position || '',
    department: contact.department || '',
    notes: contact.notes || ''
  };
  showEditContactModal.value = true;
}

function closeEditContactModal() {
  showEditContactModal.value = false;
  editingContact.value = null;
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
}

async function saveContactEdit() {
  try {
    saving.value = true;
    await api.updateContact(editingContact.value.id, contactForm.value);
    
    // Reload company details
    const updatedCompany = await api.getCompany(selectedCompany.value.id);
    selectedCompany.value = updatedCompany;
    
    // Update in companies list
    const index = companies.value.findIndex(c => c.id === selectedCompany.value.id);
    if (index !== -1) {
      companies.value[index] = updatedCompany;
    }
    
    closeEditContactModal();
  } catch (error) {
    console.error('Error updating contact:', error);
    alert('Error updating contact');
  } finally {
    saving.value = false;
  }
}

async function removeContact(contact) {
  if (!confirm(`Remove "${contact.first_name} ${contact.last_name}" from this company?`)) {
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
    console.error('Error removing contact:', error);
    alert('Error removing contact');
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
    console.error('Error updating primary contact:', error);
    alert('Error updating primary contact');
  }
}
</script>
