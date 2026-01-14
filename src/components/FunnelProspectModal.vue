<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    style="z-index: 10000;"
    @click="prospect ? closeModal : null"
  >
    <div 
      class="relative top-8 mx-auto p-6 border w-11/12 max-w-5xl shadow-lg rounded-lg bg-white" 
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <div v-if="prospect" class="w-3 h-3 rounded-full mr-3" :class="getStatusColor(prospect.status)"></div>
          <h3 class="text-2xl font-bold text-gray-900">
            {{ prospect ? prospect.name : 'New Lead' }}
          </h3>
          <span v-if="prospect" class="ml-3 px-3 py-1 text-sm rounded-full" :class="getStatusBadge(prospect.status)">
            {{ prospect.status?.toUpperCase() }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button 
            v-if="prospect"
            @click="openEditModal" 
            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit in full modal"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column - Basic Info -->
        <div class="space-y-6">
          <!-- Contact Info -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
            <div class="space-y-4">
              <!-- Name -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Name:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.name && prospect" class="text-gray-900">{{ form.name }}</span>
                  <input 
                    v-if="editing.name || !prospect"
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Enter prospect name"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('name') : null"
                    @keyup.enter="prospect ? saveField('name') : null"
                  >
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('name')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Email -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Email:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.email && prospect" class="text-gray-900">{{ form.email || 'No email' }}</span>
                  <input 
                    v-if="editing.email || !prospect"
                    v-model="form.email"
                    type="email"
                    placeholder="Enter email address"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('email') : null"
                    @keyup.enter="prospect ? saveField('email') : null"
                  >
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('email')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Phone -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Phone:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.phone && prospect" class="text-gray-900">{{ form.phone || 'No phone' }}</span>
                  <input 
                    v-if="editing.phone || !prospect"
                    v-model="form.phone"
                    type="tel"
                    placeholder="Enter phone number"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('phone') : null"
                    @keyup.enter="prospect ? saveField('phone') : null"
                  >
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('phone')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Company with Autocomplete -->
              <div class="flex items-center relative">
                <label class="w-20 text-sm font-medium text-gray-600">Company:</label>
                <div class="flex-1 flex items-center relative">
                  <span v-if="!editing.company && prospect" class="text-gray-900">{{ form.company || 'No company' }}</span>
                  <div v-if="editing.company || !prospect" class="flex-1 relative">
                    <input 
                      v-model="companySearchQuery"
                      @input="onCompanyInput($event.target.value)"
                      @focus="onCompanyFocus"
                      @blur="onCompanyBlur"
                      type="text"
                      placeholder="Type to search companies..."
                      class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <!-- Company Autocomplete Dropdown -->
                    <div
                      v-if="showCompanyDropdown && (filteredCompanies.length > 0 || companySearchQuery)"
                      class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[60]"
                    >
                      <div
                        v-for="company in filteredCompanies"
                        :key="company.id"
                        @mousedown.prevent="selectCompany(company); if (prospect) { editing.company = false; saveField('company') }"
                        class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                      >
                        <div class="text-gray-900 text-sm font-medium">{{ company.name }}</div>
                        <div v-if="company.address" class="text-gray-500 text-xs">{{ company.address }}</div>
                      </div>
                      <!-- Create new company option -->
                      <div
                        v-if="companySearchQuery && filteredCompanies.length === 0"
                        @mousedown.prevent="createNewCompany"
                        class="px-3 py-2 hover:bg-blue-50 cursor-pointer border-t-2 border-blue-200 bg-blue-50"
                      >
                        <div class="text-blue-600 text-sm font-medium flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Create new company "{{ companySearchQuery }}"
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('company'); if (editing.company) companySearchQuery = form.company || ''"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Contact with Autocomplete -->
              <div class="flex items-center relative">
                <label class="w-20 text-sm font-medium text-gray-600">Contact:</label>
                <div class="flex-1 flex items-center relative">
                  <span v-if="!editing.contact && prospect" class="text-gray-900">{{ form.contact || 'No contact' }}</span>
                  <div v-if="editing.contact || !prospect" class="flex-1 relative">
                    <input 
                      v-model="contactSearchQuery"
                      @input="onContactInput($event.target.value)"
                      @focus="onContactFocus"
                      @blur="onContactBlur"
                      type="text"
                      :placeholder="selectedCompany ? 'Type to search contacts...' : 'Select company first'"
                      :disabled="!selectedCompany"
                      class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                    <!-- Contact Autocomplete Dropdown -->
                    <div
                      v-if="showContactDropdown && filteredContacts.length > 0"
                      class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[60]"
                    >
                      <div
                        v-for="contact in filteredContacts"
                        :key="contact.id"
                        @mousedown.prevent="selectContact(contact); if (prospect) { editing.contact = false; saveField('contact') }"
                        class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                      >
                        <div class="flex items-center gap-2">
                          <div class="text-gray-900 text-sm font-medium">{{ contact.first_name }} {{ contact.last_name }}</div>
                          <span v-if="contact.is_primary" class="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Primary</span>
                        </div>
                        <div v-if="contact.position" class="text-gray-500 text-xs">{{ contact.position }}</div>
                        <div v-if="contact.email" class="text-gray-500 text-xs">{{ contact.email }}</div>
                        <div v-if="contact.phone" class="text-gray-500 text-xs">{{ contact.phone }}</div>
                      </div>
                    </div>
                  </div>
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('contact'); if (editing.contact) contactSearchQuery = form.contact || ''"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Address -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Address:</label>
                <div class="flex-1 flex flex-col">
                  <div class="flex items-center">
                    <span v-if="!editing.address && prospect" class="text-gray-900 flex-1">{{ getFullAddress }}</span>
                    <textarea 
                      v-if="editing.address || !prospect"
                      v-model="form.address"
                      rows="2"
                      :placeholder="selectedCompany?.address ? 'Company address (editable)' : 'Complete address for geolocation'"
                      class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @blur="prospect ? saveField('address') : null"
                    ></textarea>
                    <button 
                      v-if="prospect"
                      @click="toggleEdit('address')"
                      class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <span v-if="selectedCompany?.address && (editing.address || !prospect)" class="text-xs text-gray-500 mt-1">
                    📍 From company: {{ selectedCompany.name }}
                  </span>
                </div>
              </div>

              <!-- Tab Selection -->
              <div class="flex items-center">
                <label class="w-20 text-sm font-medium text-gray-600">Tab:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.tabId && prospect" class="text-gray-900">
                    {{ getTabName(form.tabId) || 'No tab' }}
                  </span>
                  <select 
                    v-if="editing.tabId || !prospect"
                    v-model="form.tabId"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="prospect ? saveField('tabId') : null"
                    @change="prospect ? saveField('tabId') : null"
                  >
                    <option v-for="tab in availableTabs" :key="tab.id" :value="tab.id">
                      {{ tab.name }}
                    </option>
                  </select>
                  <button 
                    v-if="prospect"
                    @click="toggleEdit('tabId')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Business Info -->
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">Business Information</h4>
            <div class="space-y-4">
              <!-- Revenue -->
              <div class="flex items-center">
                <label class="w-24 text-sm font-medium text-gray-600">Revenue:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.revenue" class="text-green-700 font-semibold">{{ formatCurrency(form.revenue || 0) }}</span>
                  <input 
                    v-else 
                    v-model.number="form.revenue"
                    type="number"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="saveField('revenue')"
                    @keyup.enter="saveField('revenue')"
                  >
                  <button 
                    @click="toggleEdit('revenue')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Probability -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-600 flex items-center justify-between">
                  <span>Probability:</span>
                  <span class="text-lg font-bold text-blue-600">{{ form.probability_coefficient !== undefined ? form.probability_coefficient : 100 }}%</span>
                </label>
                <div class="relative">
                  <input 
                    v-model.number="form.probability_coefficient"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    @input="onProbabilityChange"
                                        :style="{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${form.probability_coefficient !== undefined ? form.probability_coefficient : 100}%, #E5E7EB ${form.probability_coefficient !== undefined ? form.probability_coefficient : 100}%, #E5E7EB 100%)` }"
                  >
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <!-- Estimated Date -->
              <div class="flex items-center">
                <label class="w-24 text-sm font-medium text-gray-600">Est. Date:</label>
                <div class="flex-1 flex items-center">
                  <span v-if="!editing.estimated_completion_date" class="text-purple-700">
                    {{ form.estimated_completion_date ? formatDate(form.estimated_completion_date) : 'No date set' }}
                  </span>
                  <input 
                    v-else 
                    v-model="form.estimated_completion_date"
                    type="date"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @blur="saveField('estimated_completion_date')"
                    @keyup.enter="saveField('estimated_completion_date')"
                  >
                  <button 
                    @click="toggleEdit('estimated_completion_date')"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Status -->
              <div class="flex items-center">
                <label class="w-24 text-sm font-medium text-gray-600">Status:</label>
                <div class="flex-1 flex items-center">
                  <select 
                    v-model="form.status"
                    @change="saveField('status')"
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cold">❄️ COLD</option>
                    <option value="warm">🌡️ WARM</option>
                    <option value="hot">🔥 HOT</option>
                    <option value="recurring">🔄 RECURRING</option>
                    <option value="won">✅ WON</option>
                    <option value="lost">❌ LOST</option>
                  </select>
                </div>
              </div>

              <!-- Recurring Settings - show only if status is recurring -->
              <div v-if="form.status === 'recurring'" class="space-y-4 border-t pt-4 mt-4">
                <h5 class="font-medium text-purple-800 flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recurring Settings
                </h5>
                
                <!-- Recurrence Interval -->
                <div class="flex items-center">
                  <label class="w-24 text-sm font-medium text-gray-600">Interval:</label>
                  <div class="flex-1 flex items-center">
                    <span v-if="!editing.recurrence_months" class="text-purple-700">
                      {{ getRecurrenceText(form.recurrence_months) }}
                    </span>
                    <select 
                      v-else 
                      v-model.number="form.recurrence_months"
                      class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @blur="saveField('recurrence_months')"
                      @change="saveField('recurrence_months')"
                    >
                      <option :value="1">Every month</option>
                      <option :value="2">Every 2 months</option>
                      <option :value="3">Every 3 months (Quarterly)</option>
                      <option :value="6">Every 6 months</option>
                      <option :value="12">Every 12 months (Yearly)</option>
                      <option :value="24">Every 24 months</option>
                    </select>
                    <button 
                      @click="toggleEdit('recurrence_months')"
                      class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Next Followup Date -->
                <div class="flex items-center">
                  <label class="w-24 text-sm font-medium text-gray-600">Next Due:</label>
                  <div class="flex-1 flex items-center">
                    <span v-if="!editing.next_followup_date" class="text-purple-700">
                      {{ form.next_followup_date ? formatDate(form.next_followup_date) : 'No date set' }}
                    </span>
                    <input 
                      v-else 
                      v-model="form.next_followup_date"
                      type="date"
                      class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @blur="saveField('next_followup_date')"
                      @keyup.enter="saveField('next_followup_date')"
                    >
                    <button 
                      @click="toggleEdit('next_followup_date')"
                      class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Notes & Todo -->
        <div class="flex flex-col h-full space-y-4 max-h-full overflow-hidden">
          <!-- Notes Section -->
          <div class="flex flex-col bg-blue-50 rounded-lg p-4 min-h-0 flex-1">
            <div class="flex items-center justify-between mb-3 flex-shrink-0">
              <h4 class="text-lg font-semibold text-gray-800">Notes</h4>
            </div>
            
            <!-- Notes Editor with fixed height and overflow -->
            <div class="flex flex-col min-h-0 flex-1">
              <div class="flex-1 min-h-0">
                <RichTextEditor
                  v-model="form.notes"
                  placeholder="Add your notes here..."
                  class="h-full"
                  :apply-daily-colors="true"
                  :notes-last-updated="form.notes_last_updated"
                  @blur="prospect ? saveField('notes') : null"
                  @input="onNotesChange"
                />
              </div>
              
              <!-- Last updated - always visible at bottom of notes -->
              <div v-if="form.notes_last_updated" class="mt-2 text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded flex-shrink-0">
                Last updated: {{ formatDateTime(form.notes_last_updated) }}
              </div>
            </div>
          </div>

          <!-- Todo List - Compact section with max height -->
          <div v-if="prospect && prospect.id" class="flex-shrink-0 max-h-80 overflow-hidden">
            <TodoList 
              :prospect-id="prospect.id"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-500">
            Weighted Revenue: <span class="font-semibold text-green-600">{{ formatCurrency(getWeightedRevenue()) }}</span>
          </div>
          <!-- Bouton de suppression - uniquement pour les prospects existants -->
          <button 
            v-if="prospect"
            @click="deleteProspect"
            class="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 hover:border-red-500"
            title="Delete this lead"
          >
            🗑️ Delete Lead
          </button>
        </div>
        <div class="flex space-x-3">
          <!-- Pour nouveau prospect : boutons Cancel et Create Lead -->
          <template v-if="!prospect">
            <button 
              @click="closeModal"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="createProspect"
              :disabled="!form.name.trim()"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Lead
            </button>
          </template>
          <!-- Pour prospect existant : pas de boutons, fermeture par croix ou clic extérieur -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useProspectsStore } from '../stores/prospects'
import { useAuthStore } from '../stores/auth'
import api, { companiesAPI } from '../services/api'
import RichTextEditor from './RichTextEditor.vue'
import TodoList from './TodoList.vue'

const props = defineProps({
  show: Boolean,
  prospect: Object,
  currentTabId: {
    type: String,
    default: 'default'
  },
  initialStatus: {
    type: String,
    default: 'cold'
  },
  leadTimes: {
    type: Object,
    default: () => ({
      coldProbability: 0,
      warmProbability: 45,
      hotProbability: 80,
      recurringProbability: 30
    })
  }
})

const emit = defineEmits(['close', 'save', 'edit', 'delete'])

const prospectsStore = useProspectsStore()
const authStore = useAuthStore()
const availableTabsRef = ref([])

// Fonction pour charger les onglets depuis l'API
const loadAvailableTabs = async () => {
  try {
    console.log('📋 Loading available tabs from API...')
    const response = await api.get('/tabs')
    // Filtrer pour ne garder que les onglets non-spéciaux pour l'assignation
    availableTabsRef.value = response.data.filter(tab => !tab.is_special)
    console.log('📋 Available tabs for assignment:', availableTabsRef.value)
    
    // Si on crée un nouveau prospect et qu'on n'a pas encore de tabId, utiliser le premier onglet disponible
    if (!props.prospect && !form.tabId && availableTabsRef.value.length > 0) {
      // Essayer d'utiliser l'onglet actuel ou le premier disponible
      const defaultTab = availableTabsRef.value.find(t => t.id === props.currentTabId) || availableTabsRef.value[0]
      form.tabId = defaultTab.id
      console.log('📋 Set default tab for new prospect:', defaultTab.name)
    }
  } catch (error) {
    console.error('❌ Error loading tabs:', error)
    availableTabsRef.value = []
  }
}

// Écouter les changements d'onglets
const handleTabsChanged = () => {
  console.log('📋 FunnelProspectModal: Received tabsChanged event, reloading tabs')
  loadAvailableTabs()
}

// Écouter les changements de companies
const handleCompaniesChanged = () => {
  console.log('🏢 FunnelProspectModal: Received companiesChanged event, reloading companies')
  loadCompanies()
}

// Computed pour les onglets disponibles
const availableTabs = computed(() => availableTabsRef.value)

// Companies and Contacts management
const companies = ref([])
const selectedCompany = ref(null)
const companySearchQuery = ref('')
const showCompanyDropdown = ref(false)
const contactSearchQuery = ref('')
const showContactDropdown = ref(false)
const companyContacts = ref([])

// Load companies
const loadCompanies = async () => {
  try {
    const response = await companiesAPI.getAll()
    companies.value = response || []
    console.log('📦 Loaded companies:', companies.value.length)
  } catch (error) {
    console.error('❌ Error loading companies:', error)
    companies.value = []
  }
}

// Load contacts for selected company
const loadCompanyContacts = async (companyId) => {
  try {
    const response = await companiesAPI.get(companyId)
    companyContacts.value = response.contacts || []
    console.log('👥 Loaded contacts for company:', companyContacts.value.length)
  } catch (error) {
    console.error('❌ Error loading company contacts:', error)
    companyContacts.value = []
  }
}

// Filter companies based on search
const filteredCompanies = computed(() => {
  if (!companySearchQuery.value) return companies.value
  const query = companySearchQuery.value.toLowerCase()
  return companies.value.filter(c => 
    c.name.toLowerCase().includes(query) ||
    (c.address && c.address.toLowerCase().includes(query))
  )
})

// Filter contacts based on search
const filteredContacts = computed(() => {
  if (!contactSearchQuery.value) return companyContacts.value
  const query = contactSearchQuery.value.toLowerCase()
  return companyContacts.value.filter(c => 
    c.first_name.toLowerCase().includes(query) ||
    c.last_name.toLowerCase().includes(query) ||
    (c.email && c.email.toLowerCase().includes(query)) ||
    (c.position && c.position.toLowerCase().includes(query))
  )
})

// Get full address for display
const getFullAddress = computed(() => {
  const parts = []
  if (form.address && form.address.trim()) parts.push(form.address.trim())
  if (form.city && form.city.trim()) parts.push(form.city.trim())
  if (form.postal_code && form.postal_code.trim()) parts.push(form.postal_code.trim())
  if (form.country && form.country.trim()) parts.push(form.country.trim())
  return parts.length > 0 ? parts.join(', ') : 'No address'
})

// Select a company
const selectCompany = async (company) => {
  selectedCompany.value = company
  form.company = company.name
  form.company_id = company.id  // Store company_id for database relation
  companySearchQuery.value = company.name
  showCompanyDropdown.value = false
  
  // Auto-fill address and coordinates from company (ALWAYS override with company data)
  if (company.address) {
    form.address = company.address
  }
  if (company.city) {
    form.city = company.city
  }
  if (company.country) {
    form.country = company.country
  }
  if (company.postal_code) {
    form.postal_code = company.postal_code
  }
  if (company.latitude !== undefined && company.longitude !== undefined) {
    form.latitude = company.latitude
    form.longitude = company.longitude
  }
  
  // Load company contacts
  await loadCompanyContacts(company.id)
  
  // If there's a primary contact, select it automatically
  const primaryContact = companyContacts.value.find(c => c.is_primary)
  if (primaryContact) {
    selectContact(primaryContact)
  }
}

// Select a contact
const selectContact = (contact) => {
  const fullName = `${contact.first_name} ${contact.last_name}`
  form.contact = fullName
  form.contact_id = contact.id  // Store contact_id for database relation
  contactSearchQuery.value = fullName
  showContactDropdown.value = false
  
  // Auto-fill email and phone from contact
  if (contact.email && !form.email) {
    form.email = contact.email
  }
  if (contact.phone && !form.phone) {
    form.phone = contact.phone
  }
}

// Handle company input change
const onCompanyInput = (value) => {
  companySearchQuery.value = value
  form.company = value
  showCompanyDropdown.value = true
  
  // If input is cleared or manually typed, reset selected company and contacts
  if (!value) {
    selectedCompany.value = null
    companyContacts.value = []
    form.company_id = null
    form.contact_id = null
  } else {
    // If user is typing manually (not selecting from dropdown), clear IDs
    form.company_id = null
    form.contact_id = null
  }
}

// Handle company focus
const onCompanyFocus = () => {
  showCompanyDropdown.value = true
}

// Handle company blur
const onCompanyBlur = () => {
  setTimeout(() => showCompanyDropdown.value = false, 200)
}

// Handle contact input change
const onContactInput = (value) => {
  contactSearchQuery.value = value
  form.contact = value
  showContactDropdown.value = selectedCompany.value !== null
}

// Handle contact focus
const onContactFocus = () => {
  if (selectedCompany.value) {
    showContactDropdown.value = true
  }
}

// Handle contact blur
const onContactBlur = () => {
  setTimeout(() => showContactDropdown.value = false, 200)
}

// Create new company
const createNewCompany = async () => {
  try {
    const newCompany = {
      name: companySearchQuery.value,
      address: form.address || ''
    }
    
    const response = await companiesAPI.create(newCompany)
    console.log('✅ Created new company:', response)
    
    // Add to companies list
    companies.value.push(response)
    
    // Select the newly created company
    await selectCompany(response)
    
    if (props.prospect) {
      editing.company = false
      saveField('company')
    }
  } catch (error) {
    console.error('❌ Error creating company:', error)
    alert('Failed to create company. Please try again.')
  }
}

// Watch companies to match with existing prospect company
watch(companies, async (newCompanies) => {
  if (props.prospect && props.prospect.company && newCompanies.length > 0 && !selectedCompany.value) {
    const matchedCompany = newCompanies.find(c => c.name === props.prospect.company)
    if (matchedCompany) {
      selectedCompany.value = matchedCompany
      companySearchQuery.value = matchedCompany.name
      
      // If prospect doesn't have an address but company does, use company address
      if (!props.prospect.address && matchedCompany.address) {
        form.address = matchedCompany.address
      }
      
      await loadCompanyContacts(matchedCompany.id)
    }
  }
})

// Lifecycle hooks
onMounted(async () => {
  loadAvailableTabs()
  await loadCompanies()
  window.addEventListener('tabsChanged', handleTabsChanged)
  window.addEventListener('companiesChanged', handleCompaniesChanged)
  
  // Initialize search queries if in edit mode
  if (props.prospect) {
    companySearchQuery.value = props.prospect.company || ''
    contactSearchQuery.value = props.prospect.contact || ''
  }
})

onUnmounted(() => {
  window.removeEventListener('tabsChanged', handleTabsChanged)
  window.removeEventListener('companiesChanged', handleCompaniesChanged)
})

// Recharger les companies quand la modal s'ouvre
watch(() => props.show, async (newShow) => {
  if (newShow) {
    console.log('🔄 Modal opened, reloading companies...')
    await loadCompanies()
  }
})

// Helper function pour obtenir la probabilité par défaut selon le status
const getDefaultProbability = (status) => {
  console.log('🎯 getDefaultProbability called with status:', status)
  console.log('🎯 leadTimes:', props.leadTimes)
  
  if (!props.leadTimes) {
    console.log('⚠️ No leadTimes, returning 100')
    return 100
  }
  
  let probability = 100
  switch (status) {
    case 'cold':
      probability = props.leadTimes.coldProbability !== undefined ? props.leadTimes.coldProbability : 0
      break
    case 'warm':
      probability = props.leadTimes.warmProbability !== undefined ? props.leadTimes.warmProbability : 45
      break
    case 'hot':
      probability = props.leadTimes.hotProbability !== undefined ? props.leadTimes.hotProbability : 80
      break
    case 'recurring':
      probability = props.leadTimes.recurringProbability !== undefined ? props.leadTimes.recurringProbability : 30
      break
    case 'won':
      probability = 100
      break
    case 'lost':
      probability = 0
      break
    default:
      probability = 100
  }
  
  console.log(`✅ Returning probability ${probability}% for status '${status}'`)
  return probability
}

// Form data
const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  contact: '',
  address: '',
  city: '',
  country: '',
  postal_code: '',
  latitude: null,
  longitude: null,
  status: props.initialStatus || 'cold',
  revenue: 0,
  probability_coefficient: getDefaultProbability(props.initialStatus || 'cold'),
  notes: '',
  notes_last_updated: null,
  estimated_completion_date: '',
  recurrence_months: 12,
  next_followup_date: '',
  tabId: '',
  company_id: null,
  contact_id: null
})

// Editing state for each field
const editing = reactive({
  name: false,
  email: false,
  phone: false,
  company: false,
  contact: false,
  address: false,
  revenue: false,
  probability_coefficient: false,
  estimated_completion_date: false,
  status: false,
  recurrence_months: false,
  next_followup_date: false,
  tabId: false
})

// Watch for prospect changes
watch(() => props.prospect, (newProspect) => {
  if (newProspect) {
    Object.assign(form, {
      name: newProspect.name || '',
      email: newProspect.email || '',
      phone: newProspect.phone || '',
      company: newProspect.company || '',
      contact: newProspect.contact || newProspect.position || '',
      address: newProspect.address || '',
      city: newProspect.city || '',
      country: newProspect.country || '',
      postal_code: newProspect.postal_code || '',
      latitude: newProspect.latitude || null,
      longitude: newProspect.longitude || null,
      status: newProspect.status || 'cold',
      revenue: newProspect.revenue || 0,
      probability_coefficient: newProspect.probability_coefficient !== undefined ? newProspect.probability_coefficient : getDefaultProbability(newProspect.status || 'cold'),
      notes: newProspect.notes || '',
      notes_last_updated: newProspect.notes_last_updated || null,
      estimated_completion_date: newProspect.estimated_completion_date || '',
      recurrence_months: newProspect.recurrence_months || 12,
      next_followup_date: newProspect.next_followup_date || '',
      tabId: newProspect.tabId || newProspect.tab_id || '',
      company_id: newProspect.company_id || null,
      contact_id: newProspect.contact_id || null
    })
  } else {
    // Reset form for new prospect
    const status = props.initialStatus || 'cold'
    
    Object.assign(form, {
      name: '',
      email: '',
      phone: '',
      company: '',
      contact: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      latitude: null,
      longitude: null,
      status: status,
      revenue: 0,
      probability_coefficient: getDefaultProbability(status),
      notes: '',
      notes_last_updated: null,
      estimated_completion_date: '',
      recurrence_months: 12,
      next_followup_date: '',
      tabId: '',
      company_id: null,
      contact_id: null
    })
    // Re-set default tab for new prospect
    if (availableTabsRef.value.length > 0) {
      const defaultTab = availableTabsRef.value.find(t => t.id === props.currentTabId) || availableTabsRef.value[0]
      form.tabId = defaultTab.id
    }
  }
}, { immediate: true })

// Watch for initialStatus changes (for new prospects)
watch(() => props.initialStatus, (newStatus) => {
  if (!props.prospect && newStatus) {
    form.status = newStatus
    form.probability_coefficient = getDefaultProbability(newStatus)
  }
}, { immediate: true })

// Watch for leadTimes changes to update probability for new prospects
watch(() => props.leadTimes, (newLeadTimes) => {
  console.log('🔄 leadTimes changed:', newLeadTimes)
  if (!props.prospect && form.status) {
    const newProbability = getDefaultProbability(form.status)
    console.log(`🔄 Updating probability from ${form.probability_coefficient}% to ${newProbability}%`)
    form.probability_coefficient = newProbability
  }
}, { deep: true })

// Watch pour currentTabId
watch(() => props.currentTabId, (newTabId) => {
  if (!props.prospect && newTabId && availableTabsRef.value.length > 0) {
    // Pour un nouveau lead, mettre à jour le tabId si l'onglet existe
    const targetTab = availableTabsRef.value.find(t => t.id === newTabId)
    if (targetTab) {
      form.tabId = targetTab.id
      console.log('Updated form tabId to:', targetTab.id)
    }
  }
})

// Toggle edit mode for a field
function toggleEdit(field) {
  if (editing[field]) {
    // Currently editing, save the field
    saveField(field)
  } else {
    // Start editing
    editing[field] = true
    
    // For date field, ensure we have the current value in the form
    if (field === 'estimated_completion_date') {
      console.log(`📅 Starting edit for date. Current prospect value: ${props.prospect.estimated_completion_date}`)
      console.log(`📅 Current form value: ${form.estimated_completion_date}`)
      
      // Sync form with prospect if they differ
      if (form.estimated_completion_date !== props.prospect.estimated_completion_date) {
        form.estimated_completion_date = props.prospect.estimated_completion_date || ''
        console.log(`📅 Synced form date to: ${form.estimated_completion_date}`)
      }
    }
  }
}

// Save a specific field
async function saveField(field) {
  // Pour les nouveaux prospects (sans ID), ne pas sauvegarder automatiquement
  // La sauvegarde se fera uniquement lors du clic sur "Create Lead"
  if (!props.prospect || !props.prospect.id) {
    console.log(`🔄 Skipping auto-save for new prospect field '${field}' - will save on Create Lead`)
    editing[field] = false
    return
  }

  try {
    console.log(`🔄 Saving field '${field}' with value:`, form[field])
    
    const updateData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      company_id: form.company_id,
      contact: form.contact,
      address: form.address,
      city: form.city,
      country: form.country,
      postal_code: form.postal_code,
      latitude: form.latitude,
      longitude: form.longitude,
      status: form.status,
      revenue: form.revenue,
      probability_coefficient: form.probability_coefficient,
      notes: form.notes,
      notes_last_updated: form.notes_last_updated,
      estimated_completion_date: form.estimated_completion_date,
      recurrence_months: form.recurrence_months,
      next_followup_date: form.next_followup_date,
      tabId: form.tabId || props.prospect?.tabId || props.prospect?.tab_id || 'default'
    }

    console.log(`🔄 Full update data for ${field}:`, updateData)
    
    // Mode édition pour prospect existant uniquement
    const result = await prospectsStore.updateProspect(props.prospect.id, updateData)
    
    if (result.success) {
      // Détecte si company_id a changé
      const companyChanged = field === 'company_id' || (props.prospect.company_id !== form.company_id)
      
      // Update the original prospect object
      Object.assign(props.prospect, form)
      editing[field] = false
      
      // Force reactivity update for the specific field
      if (field === 'estimated_completion_date') {
        console.log(`✅ Successfully saved estimated_completion_date: ${form.estimated_completion_date}`)
        console.log(`📅 Updated prospect object:`, props.prospect.estimated_completion_date)
      }
      
      // Log spécial pour les champs de récurrence
      if (field === 'recurrence_months' || field === 'next_followup_date') {
        console.log(`✅ Successfully saved recurring field '${field}':`, form[field])
      }
      
      // Émet un événement si la company a changé
      if (companyChanged) {
        console.log('🔄 Company changed, emitting company-changed event')
        emit('company-changed', {
          prospectId: props.prospect.id,
          oldCompanyId: props.prospect.company_id,
          newCompanyId: form.company_id
        })
      }
      
      console.log(`✅ Updated ${field} for ${props.prospect.name}`)
    } else {
      console.error('❌ Failed to update prospect:', result.error)
    }
  } catch (error) {
    console.error('❌ Error updating prospect:', error)
  }
}

// Handle probability change with debounced saving
let probabilityTimeout = null
function onProbabilityChange() {
  // Clear existing timeout
  if (probabilityTimeout) {
    clearTimeout(probabilityTimeout)
  }
  
  // Only save for existing prospects, not for new ones
  if (props.prospect && props.prospect.id) {
    // Set new timeout to save after 500ms of no changes
    probabilityTimeout = setTimeout(() => {
      saveField('probability_coefficient')
    }, 500)
  }
  // For new prospects, just update the form value (no save until Create Lead is clicked)
}

// Close modal
function closeModal() {
  emit('close')
}

// Create new prospect
async function createProspect() {
  try {
    console.log('🆕 Creating new prospect with form data:', form)
    console.log('🎯 Current probability_coefficient:', form.probability_coefficient)
    console.log('🎯 Current status:', form.status)
    
    const prospectData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      company_id: form.company_id,
      contact: form.contact,
      address: form.address,
      city: form.city,
      country: form.country,
      postal_code: form.postal_code,
      latitude: form.latitude,
      longitude: form.longitude,
      status: form.status,
      revenue: form.revenue,
      probability_coefficient: form.probability_coefficient,
      notes: form.notes,
      notes_last_updated: form.notes ? new Date().toISOString() : null,
      estimated_completion_date: form.estimated_completion_date,
      recurrence_months: form.recurrence_months,
      next_followup_date: form.next_followup_date,
      tabId: form.tabId || (availableTabsRef.value.length > 0 ? availableTabsRef.value[0].id : '')
    }
    
    console.log('📤 Sending prospectData to API:', prospectData)
    console.log('📤 Probability being sent:', prospectData.probability_coefficient)

    const result = await prospectsStore.createProspect(prospectData)
    
    if (result.success) {
      console.log('✅ Successfully created prospect:', result.prospect)
      emit('save', result.prospect)
      emit('close')
    } else {
      console.error('❌ Failed to create prospect:', result.error)
    }
  } catch (error) {
    console.error('❌ Error creating prospect:', error)
  }
}

// Delete prospect
async function deleteProspect() {
  if (!props.prospect) return
  
  const confirmDelete = confirm(`Are you sure you want to delete "${props.prospect.name}"? This action cannot be undone.`)
  
  if (confirmDelete) {
    try {
      console.log('🗑️ Deleting prospect:', props.prospect.id)
      const result = await prospectsStore.deleteProspect(props.prospect.id)
      
      if (result.success) {
        console.log('✅ Successfully deleted prospect')
        emit('delete', props.prospect)
        emit('close')
      } else {
        console.error('❌ Failed to delete prospect:', result.error)
      }
    } catch (error) {
      console.error('❌ Error deleting prospect:', error)
    }
  }
}

// Open edit modal
function openEditModal() {
  // Emit to parent to open the classic edit modal
  emit('edit', props.prospect)
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

function formatDate(dateString) {
  if (!dateString) return ''
  console.log(`📅 Formatting date: ${dateString}`)
  const date = new Date(dateString)
  const formatted = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  console.log(`📅 Formatted result: ${formatted}`)
  return formatted
}

function getRecurrenceText(months) {
  if (!months) return 'Not set'
  
  const texts = {
    1: 'Every month',
    2: 'Every 2 months',
    3: 'Every 3 months (Quarterly)',
    6: 'Every 6 months',
    12: 'Every 12 months (Yearly)',
    24: 'Every 24 months'
  }
  
  return texts[months] || `Every ${months} months`
}

function getTabName(tabId) {
  if (!tabId) return 'No tab'
  const tab = availableTabsRef.value.find(t => t.id === tabId)
  return tab ? tab.name : 'Unknown tab'
}

function getWeightedRevenue() {
  return (form.revenue || 0) * (form.probability_coefficient !== undefined ? form.probability_coefficient : 100) / 100
}

// Handle notes change - update timestamp
// Handle notes change - update timestamp
let lastNotesValue = ''
function onNotesChange() {
  // Pour éviter de mettre à jour le timestamp à chaque caractère, on le fait seulement si c'est vraiment différent
  if (props.prospect && props.prospect.id && form.notes !== lastNotesValue) {
    form.notes_last_updated = new Date().toISOString()
    lastNotesValue = form.notes
  }
}

// Format date and time for display
function formatDateTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  // Si c'est aujourd'hui
  if (diffDays === 0) {
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  
  // Si c'est hier
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // Si c'est dans la semaine
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // Sinon date complète
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  })
}

function getStatusColor(status) {
  const colors = {
    hot: 'bg-red-500',
    warm: 'bg-yellow-500',
    cold: 'bg-blue-500',
    recurring: 'bg-purple-500',
    won: 'bg-green-500',
    lost: 'bg-gray-500'
  }
  return colors[status] || 'bg-gray-500'
}

function getStatusBadge(status) {
  const badges = {
    hot: 'bg-red-100 text-red-800',
    warm: 'bg-yellow-100 text-yellow-800',
    cold: 'bg-blue-100 text-blue-800',
    recurring: 'bg-purple-100 text-purple-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-gray-100 text-gray-800'
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
/* Custom slider styles */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3B82F6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #2563EB;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3B82F6;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: #2563EB;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.slider:focus {
  outline: none;
}
</style>