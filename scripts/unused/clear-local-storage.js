// Clear Local Storage Script
// Run this in the browser console to clear all LearnKick local storage data

console.log('🧹 Clearing LearnKick local storage...')

// Clear localStorage items
const keysToRemove = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key && (key.includes('learnkick') || key.includes('questions') || key.includes('admin-language'))) {
    keysToRemove.push(key)
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key)
  console.log(`🗑️ Removed localStorage key: ${key}`)
})

// Clear IndexedDB (if available)
if ('indexedDB' in window) {
  console.log('🗄️ Attempting to clear IndexedDB...')
  
  // Clear LearnKick IndexedDB
  const deleteLearnKickDB = indexedDB.deleteDatabase('LearnKickDB')
  deleteLearnKickDB.onsuccess = () => console.log('✅ LearnKickDB cleared')
  deleteLearnKickDB.onerror = (e) => console.log('❌ Failed to clear LearnKickDB:', e)
  
  // Clear questions database if it exists
  const deleteQuestionsDB = indexedDB.deleteDatabase('QuestionsDB') 
  deleteQuestionsDB.onsuccess = () => console.log('✅ QuestionsDB cleared')
  deleteQuestionsDB.onerror = (e) => console.log('❌ Failed to clear QuestionsDB:', e)
}

// Clear sessionStorage
sessionStorage.clear()
console.log('✅ SessionStorage cleared')

console.log('🎉 Local storage cleanup complete!')
console.log('💡 Reload the page to see the clean state')