// Script de test de performance pour Maplyo
// À exécuter dans la console du navigateur

console.log('🧪 Démarrage des tests de performance Maplyo...')

// Test 1: Temps de rendu des listes
const testListRendering = async (prospectCount = 1000) => {
  console.log(`📊 Test de rendu avec ${prospectCount} prospects...`)
  
  const startTime = performance.now()
  
  // Simuler une liste de prospects
  const mockProspects = Array.from({ length: prospectCount }, (_, i) => ({
    id: i + 1,
    name: `Prospect ${i + 1}`,
    email: `prospect${i + 1}@example.com`,
    company: `Company ${Math.floor(i / 10) + 1}`,
    status: ['hot', 'warm', 'cold', 'won', 'lost'][i % 5],
    revenue: Math.floor(Math.random() * 100000),
    probability_coefficient: Math.floor(Math.random() * 100) + 1,
    address: `${i + 1} Street, City`,
    notes: `Notes for prospect ${i + 1}`,
    tabId: 'default'
  }))
  
  // Mesurer le temps de calcul des revenus pondérés
  const weightedRevenueStart = performance.now()
  const weightedRevenues = mockProspects.map(p => (p.revenue * p.probability_coefficient) / 100)
  const weightedRevenueTime = performance.now() - weightedRevenueStart
  
  // Mesurer le temps de filtrage
  const filterStart = performance.now()
  const hotProspects = mockProspects.filter(p => p.status === 'hot')
  const filterTime = performance.now() - filterStart
  
  // Mesurer le temps de tri
  const sortStart = performance.now()
  const sortedProspects = [...mockProspects].sort((a, b) => b.revenue - a.revenue)
  const sortTime = performance.now() - sortStart
  
  const totalTime = performance.now() - startTime
  
  console.log(`✅ Résultats pour ${prospectCount} prospects:`)
  console.log(`   Temps total: ${totalTime.toFixed(2)}ms`)
  console.log(`   Calcul revenus pondérés: ${weightedRevenueTime.toFixed(2)}ms`)
  console.log(`   Filtrage: ${filterTime.toFixed(2)}ms`)
  console.log(`   Tri: ${sortTime.toFixed(2)}ms`)
  console.log(`   Hot prospects trouvés: ${hotProspects.length}`)
  
  return {
    prospectCount,
    totalTime,
    weightedRevenueTime,
    filterTime,
    sortTime,
    hotProspectsCount: hotProspects.length
  }
}

// Test 2: Performance des caches
const testCachePerformance = () => {
  console.log('🔄 Test de performance des caches...')
  
  const cache = new Map()
  const iterations = 10000
  
  // Test d'écriture en cache
  const writeStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    cache.set(`key-${i}`, { id: i, data: `data-${i}` })
  }
  const writeTime = performance.now() - writeStart
  
  // Test de lecture en cache
  const readStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    cache.get(`key-${i}`)
  }
  const readTime = performance.now() - readStart
  
  console.log(`✅ Performance cache (${iterations} opérations):`)
  console.log(`   Écriture: ${writeTime.toFixed(2)}ms`)
  console.log(`   Lecture: ${readTime.toFixed(2)}ms`)
  
  return { writeTime, readTime, cacheSize: cache.size }
}

// Test 3: Performance de la recherche
const testSearchPerformance = (prospects, searchTerms) => {
  console.log(`🔍 Test de performance de recherche...`)
  
  const searchInProspect = (prospect, query) => {
    const searchTerm = query.toLowerCase()
    return (
      (prospect.name && prospect.name.toLowerCase().includes(searchTerm)) ||
      (prospect.email && prospect.email.toLowerCase().includes(searchTerm)) ||
      (prospect.company && prospect.company.toLowerCase().includes(searchTerm))
    )
  }
  
  const terms = searchTerms || ['prospect', 'company', '@example', 'hot', '123']
  const results = []
  
  terms.forEach(term => {
    const searchStart = performance.now()
    const matches = prospects.filter(p => searchInProspect(p, term))
    const searchTime = performance.now() - searchStart
    
    results.push({ term, matches: matches.length, time: searchTime })
    console.log(`   "${term}": ${matches.length} résultats en ${searchTime.toFixed(2)}ms`)
  })
  
  return results
}

// Test 4: Performance du drag & drop simulé
const testDragDropPerformance = (prospects) => {
  console.log(`🎯 Test de performance drag & drop...`)
  
  const statuses = ['hot', 'warm', 'cold', 'won', 'lost']
  const moves = []
  
  const moveStart = performance.now()
  
  // Simuler 100 déplacements
  for (let i = 0; i < 100; i++) {
    const prospect = prospects[Math.floor(Math.random() * prospects.length)]
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    if (prospect.status !== newStatus) {
      prospect.status = newStatus
      moves.push({ id: prospect.id, from: prospect.status, to: newStatus })
    }
  }
  
  const moveTime = performance.now() - moveStart
  
  console.log(`✅ ${moves.length} déplacements simulés en ${moveTime.toFixed(2)}ms`)
  
  return { moves: moves.length, time: moveTime }
}

// Exécution des tests
const runPerformanceTests = async () => {
  console.log('🚀 === TESTS DE PERFORMANCE MAPLYO ===')
  
  const results = {}
  
  // Test avec différentes tailles de données
  const testSizes = [100, 500, 1000, 2000, 5000]
  
  for (const size of testSizes) {
    console.log(`\n📏 Tests avec ${size} prospects...`)
    
    // Générer les données de test
    const prospects = Array.from({ length: size }, (_, i) => ({
      id: i + 1,
      name: `Prospect ${i + 1}`,
      email: `prospect${i + 1}@example.com`,
      company: `Company ${Math.floor(i / 10) + 1}`,
      status: ['hot', 'warm', 'cold', 'won', 'lost'][i % 5],
      revenue: Math.floor(Math.random() * 100000),
      probability_coefficient: Math.floor(Math.random() * 100) + 1,
      address: `${i + 1} Street, City`,
      tabId: 'default'
    }))
    
    // Exécuter les tests
    const listResult = await testListRendering(size)
    const searchResult = testSearchPerformance(prospects)
    const dragResult = testDragDropPerformance(prospects)
    
    results[size] = {
      list: listResult,
      search: searchResult,
      drag: dragResult
    }
  }
  
  // Test des caches
  results.cache = testCachePerformance()
  
  console.log('\n📈 === RÉSUMÉ DES PERFORMANCES ===')
  
  testSizes.forEach(size => {
    const result = results[size]
    console.log(`\n${size} prospects:`)
    console.log(`  Rendu: ${result.list.totalTime.toFixed(2)}ms`)
    console.log(`  Drag & Drop: ${result.drag.time.toFixed(2)}ms`)
    console.log(`  Recherche moyenne: ${(result.search.reduce((sum, r) => sum + r.time, 0) / result.search.length).toFixed(2)}ms`)
  })
  
  // Recommandations
  console.log('\n💡 === RECOMMANDATIONS ===')
  
  const largestTest = results[testSizes[testSizes.length - 1]]
  
  if (largestTest.list.totalTime > 100) {
    console.log('⚠️  Considérer la virtualisation pour > 2000 prospects')
  } else {
    console.log('✅ Performances acceptables jusqu\'à 5000 prospects')
  }
  
  if (largestTest.drag.time > 50) {
    console.log('⚠️  Drag & drop pourrait bénéficier de throttling')
  } else {
    console.log('✅ Drag & drop performant')
  }
  
  console.log('🎉 Tests terminés!')
  
  return results
}

// Utilisation:
// runPerformanceTests()

window.testMaployoPerformance = {
  runAll: runPerformanceTests,
  testListRendering,
  testCachePerformance,
  testSearchPerformance,
  testDragDropPerformance
}

console.log('📋 Tests de performance chargés. Utilisez:')
console.log('• testMaployoPerformance.runAll() - Exécuter tous les tests')
console.log('• testMaployoPerformance.testListRendering(1000) - Test de rendu')
console.log('• testMaployoPerformance.testCachePerformance() - Test de cache')
