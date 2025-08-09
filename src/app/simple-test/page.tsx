'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TestItem {
  id: number
  name: string
  description?: string
  created_at: string
}

export default function SimpleSupabaseTest() {
  const [result, setResult] = useState<string>('✅ Connection verified! Ready to test data operations.')
  const [items, setItems] = useState<TestItem[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setResult('Testing Supabase connection...')
    
    try {
      const { error: sessionError } = await supabase.auth.getSession()
      const { data: tableData, error: tableError } = await supabase
        .from('test_items')
        .select('*')
        .limit(1)
      
      setResult(`
✅ Client Created: Success
✅ Auth Check: ${sessionError ? 'Error: ' + sessionError.message : 'Success'}
📊 Table Query: ${tableError ? 'Error: ' + tableError.message : 'Success - ' + (tableData?.length || 0) + ' items found'}
      `)
      
    } catch (err) {
      setResult(`❌ Connection Failed: ${err}`)
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('test_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setResult(`❌ Error fetching data: ${error.message}`)
      } else {
        setItems(data || [])
        setResult(`✅ Fetched ${data?.length || 0} items successfully!`)
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    }
    setLoading(false)
  }

  const addItem = async () => {
    if (!name.trim()) {
      setResult('❌ Please enter a name')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('test_items')
        .insert([{ 
          name: name.trim(), 
          description: description.trim() || null 
        }])

      if (error) {
        setResult(`❌ Error adding item: ${error.message}`)
      } else {
        setName('')
        setDescription('')
        setResult(`✅ Added item "${name}" successfully!`)
        // Refresh the list
        fetchItems()
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    }
    setLoading(false)
  }

  const deleteItem = async (id: number, itemName: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('test_items')
        .delete()
        .eq('id', id)

      if (error) {
        setResult(`❌ Error deleting item: ${error.message}`)
      } else {
        setResult(`✅ Deleted "${itemName}" successfully!`)
        // Refresh the list
        fetchItems()
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Fjalla_One, system-ui, sans-serif' }}>
      <h1 style={{ fontFamily: 'Fjalla_One, system-ui, sans-serif', fontSize: '2.5rem', marginBottom: '1rem' }}>🎉 Supabase Database Test - CONNECTED!</h1>
      
      {/* Connection Test */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '2px solid #28a745', borderRadius: '10px', backgroundColor: '#f8fff9' }}>
        <h2 style={{ fontFamily: 'Fjalla_One, system-ui, sans-serif', fontSize: '1.5rem', marginBottom: '1rem' }}>Connection Test</h2>
        <button 
          onClick={testConnection}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Fjalla_One, system-ui, sans-serif',
            fontSize: '1rem'
          }}
        >
          Test Connection
        </button>
      </div>

      {/* Add New Item */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '2px solid #0070f3', borderRadius: '10px', backgroundColor: '#f8faff' }}>
        <h2 style={{ fontFamily: 'Fjalla_One, system-ui, sans-serif', fontSize: '1.5rem', marginBottom: '1rem' }}>Add Test Data</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Item name (required)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              marginRight: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              width: '200px',
              fontFamily: 'Fjalla_One, system-ui, sans-serif'
            }}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              marginRight: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              width: '250px',
              fontFamily: 'Fjalla_One, system-ui, sans-serif'
            }}
          />
          <button 
            onClick={addItem}
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Fjalla_One, system-ui, sans-serif'
            }}
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </div>

      {/* Fetch Data */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '2px solid #ff6b35', borderRadius: '10px', backgroundColor: '#fff8f6' }}>
        <h2 style={{ fontFamily: 'Fjalla_One, system-ui, sans-serif', fontSize: '1.5rem', marginBottom: '1rem' }}>Fetch Data</h2>
        <button 
          onClick={fetchItems}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Fjalla_One, system-ui, sans-serif'
          }}
        >
          {loading ? 'Loading...' : 'Fetch All Items'}
        </button>
      </div>

      {/* Results */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'Fjalla_One, system-ui, sans-serif',
        fontSize: '14px',
        marginBottom: '20px'
      }}>
        <strong>Status:</strong> {result}
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div style={{ padding: '20px', border: '2px solid #28a745', borderRadius: '10px', backgroundColor: '#f8fff9' }}>
          <h2 style={{ fontFamily: 'Fjalla_One, system-ui, sans-serif', fontSize: '1.5rem', marginBottom: '1rem' }}>Retrieved Data ({items.length} items)</h2>
          {items.map((item) => (
            <div key={item.id} style={{ 
              padding: '10px', 
              margin: '10px 0', 
              backgroundColor: 'white', 
              border: '1px solid #ddd', 
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'Fjalla_One, system-ui, sans-serif'
            }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{item.name}</strong>
                {item.description && <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>{item.description}</p>}
                <small style={{ color: '#999', fontSize: '0.8rem' }}>
                  ID: {item.id} | Created: {new Date(item.created_at).toLocaleString()}
                </small>
              </div>
              <button
                onClick={() => deleteItem(item.id, item.name)}
                disabled={loading}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontFamily: 'Fjalla_One, system-ui, sans-serif'
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
