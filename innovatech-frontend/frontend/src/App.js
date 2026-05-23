import React, { useState, useEffect } from 'react';
import axios from 'axios';

// URL del backend desde variable de entorno (inyectada en build time)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });

// ─── Componente principal ───────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: '' });
  const [editId, setEditId] = useState(null);
  const [apiStatus, setApiStatus] = useState('Verificando...');

  // Verificar estado del backend
  useEffect(() => {
    api.get('/health')
      .then(r => setApiStatus(`✅ ${r.data.service} — Conectado`))
      .catch(() => setApiStatus('❌ Backend no disponible'));
  }, []);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/products');
      setProducts(data);
      setError(null);
    } catch {
      setError('Error al cargar productos. Verifica la conexión con el backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    try {
      if (editId) {
        await api.put(`/api/products/${editId}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      setForm({ name: '', description: '', price: '', stock: '', category: '' });
      setEditId(null);
      fetchProducts();
    } catch {
      setError('Error al guardar el producto.');
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category: p.category || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch {
      setError('Error al eliminar.');
    }
  };

  // ─── Estilos inline simples (sin dependencias extras) ──────
  const s = {
    app: { fontFamily: 'Segoe UI, sans-serif', maxWidth: 960, margin: '0 auto', padding: 24, background: '#f5f5f5', minHeight: '100vh' },
    header: { background: '#1a1a2e', color: '#fff', padding: '20px 28px', borderRadius: 12, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    badge: { background: '#16213e', padding: '6px 14px', borderRadius: 20, fontSize: 13 },
    card: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    title: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1a1a2e' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 },
    input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: '100%', boxSizing: 'border-box' },
    btnPrimary: { background: '#4361ee', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
    btnEdit: { background: '#f4a261', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', marginRight: 8, fontSize: 13 },
    btnDel: { background: '#e63946', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', background: '#f0f0f0', fontWeight: 600, fontSize: 13 },
    td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: 14 },
    error: { background: '#ffe3e3', color: '#c0392b', padding: '12px 16px', borderRadius: 8, marginBottom: 16 },
  };

  return (
    <div style={s.app}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>🏢 Innovatech Chile</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: 14 }}>Panel de Gestión de Productos</p>
        </div>
        <span style={s.badge}>{apiStatus}</span>
      </div>

      {error && <div style={s.error}>⚠️ {error}</div>}

      {/* Formulario */}
      <div style={s.card}>
        <p style={s.title}>{editId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</p>
        <form onSubmit={handleSubmit}>
          <div style={s.grid}>
            <input style={s.input} placeholder="Nombre *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input style={s.input} placeholder="Categoría" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <input style={s.input} type="number" placeholder="Precio *" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <input style={s.input} type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>
          <input style={{ ...s.input, marginTop: 12 }} placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button type="submit" style={s.btnPrimary}>{editId ? 'Actualizar' : 'Agregar Producto'}</button>
            {editId && <button type="button" style={{ ...s.btnPrimary, background: '#888' }} onClick={() => { setEditId(null); setForm({ name: '', description: '', price: '', stock: '', category: '' }); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Tabla de productos */}
      <div style={s.card}>
        <p style={s.title}>📦 Productos ({products.length})</p>
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center', padding: 30 }}>Cargando...</p>
        ) : products.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: 30 }}>No hay productos registrados.</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={s.td}>{p.id}</td>
                  <td style={s.td}><strong>{p.name}</strong><br /><span style={{ color: '#888', fontSize: 12 }}>{p.description}</span></td>
                  <td style={s.td}>{p.category || '—'}</td>
                  <td style={s.td}>${p.price?.toLocaleString('es-CL')}</td>
                  <td style={s.td}>{p.stock}</td>
                  <td style={s.td}>
                    <button style={s.btnEdit} onClick={() => handleEdit(p)}>Editar</button>
                    <button style={s.btnDel} onClick={() => handleDelete(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 12 }}>
        Innovatech Chile © 2025 — ISY1101 DevOps | Backend: {API_URL}
      </p>
    </div>
  );
}
