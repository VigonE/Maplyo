// Script pour tester le reorder côté client
// À exécuter dans la console du navigateur

console.log('🧪 Test du reorder...')

// Test de l'endpoint reorder-category
const testReorderCategory = async () => {
  try {
    console.log('📡 Testing reorder-category endpoint...')
    
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('❌ No token found in localStorage')
      return
    }
    
    // Test avec des données fictives
    const testData = {
      status: 'hot',
      order: [1, 2, 3] // IDs de prospects fictifs
    }
    
    const response = await fetch('/api/prospects/reorder-category', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    })
    
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', response.headers)
    
    const result = await response.json()
    console.log('📡 Response data:', result)
    
    if (response.ok) {
      console.log('✅ Reorder endpoint works!')
    } else {
      console.log('❌ Reorder endpoint failed:', result)
    }
    
  } catch (error) {
    console.error('❌ Error testing reorder:', error)
  }
}

// Test de récupération des prospects
const testGetProspects = async () => {
  try {
    console.log('📡 Getting prospects...')
    
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('❌ No token found')
      return
    }
    
    const response = await fetch('/api/prospects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const prospects = await response.json()
    console.log('📋 Prospects:', prospects)
    
    // Grouper par statut
    const byStatus = prospects.reduce((acc, p) => {
      acc[p.status] = acc[p.status] || []
      acc[p.status].push(p)
      return acc
    }, {})
    
    console.log('📊 Prospects by status:', byStatus)
    
    return prospects
    
  } catch (error) {
    console.error('❌ Error getting prospects:', error)
  }
}

// Test de reorder avec de vraies données
const testRealReorder = async () => {
  try {
    console.log('🎯 Testing reorder with real data...')
    
    // Récupérer les prospects
    const prospects = await testGetProspects()
    if (!prospects || prospects.length === 0) {
      console.log('⚠️ No prospects found for testing')
      return
    }
    
    // Grouper par statut
    const byStatus = prospects.reduce((acc, p) => {
      acc[p.status] = acc[p.status] || []
      acc[p.status].push(p)
      return acc
    }, {})
    
    // Tester avec la première catégorie qui a des prospects
    const statusesToTest = ['hot', 'warm', 'cold']
    let testStatus = null
    let testProspects = []
    
    for (const status of statusesToTest) {
      if (byStatus[status] && byStatus[status].length > 1) {
        testStatus = status
        testProspects = byStatus[status]
        break
      }
    }
    
    if (!testStatus) {
      console.log('⚠️ No status with multiple prospects found for testing')
      return
    }
    
    console.log(`📋 Testing reorder for status: ${testStatus}`)
    console.log(`📋 Prospects in ${testStatus}:`, testProspects.map(p => ({ id: p.id, name: p.name })))
    
    // Inverser l'ordre pour tester
    const originalOrder = testProspects.map(p => p.id)
    const newOrder = [...originalOrder].reverse()
    
    console.log('📋 Original order:', originalOrder)
    console.log('📋 New order:', newOrder)
    
    const token = localStorage.getItem('token')
    const response = await fetch('/api/prospects/reorder-category', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: testStatus,
        order: newOrder
      })
    })
    
    const result = await response.json()
    console.log('📡 Reorder result:', result)
    
    if (response.ok) {
      console.log('✅ Real reorder test successful!')
      
      // Vérifier que l'ordre a changé
      setTimeout(async () => {
        console.log('🔄 Checking if order changed...')
        const updatedProspects = await testGetProspects()
        const updatedByStatus = updatedProspects.reduce((acc, p) => {
          acc[p.status] = acc[p.status] || []
          acc[p.status].push(p)
          return acc
        }, {})
        
        const updatedTestProspects = updatedByStatus[testStatus] || []
        const updatedOrder = updatedTestProspects
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(p => p.id)
        
        console.log('📋 Updated order:', updatedOrder)
        
        if (JSON.stringify(updatedOrder) === JSON.stringify(newOrder)) {
          console.log('✅ Order successfully changed!')
        } else {
          console.log('❌ Order did not change as expected')
        }
      }, 1000)
      
    } else {
      console.log('❌ Real reorder test failed:', result)
    }
    
  } catch (error) {
    console.error('❌ Error in real reorder test:', error)
  }
}

// Exposer les fonctions de test
window.testReorder = {
  testReorderCategory,
  testGetProspects,
  testRealReorder
}

console.log('🧪 Reorder tests loaded. Use:')
console.log('• testReorder.testReorderCategory() - Test endpoint')
console.log('• testReorder.testGetProspects() - Get prospects')
console.log('• testReorder.testRealReorder() - Full reorder test')
