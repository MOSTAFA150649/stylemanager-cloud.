import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import API_BASE_URL from '../config';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/reports/stats`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API_BASE_URL}/reports/sales`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setStats(statsRes.data);
      
      // Process sales for chart
      const chartData = processSalesData(salesRes.data);
      setSalesData(chartData);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports', error);
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (sales) => {
    // Group sales by day for the last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { 
        date: d.toLocaleDateString(), 
        rawDate: d.toDateString(), 
        revenue: 0,
        count: 0
      };
    }).reverse();

    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt).toDateString();
      const dayData = last7Days.find(d => d.rawDate === saleDate);
      if (dayData) {
        dayData.revenue += sale.totalAmount;
        dayData.count += 1;
      }
    });

    return last7Days;
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/sales`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const sales = response.data;
      
      const dataToExport = sales.map(sale => ({
        ID: sale.id,
        Date: new Date(sale.createdAt).toLocaleString(),
        Client: sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Anonyme',
        Articles: sale.items.map(item => `${item.quantity}x ${item.product?.name}`).join(', '),
        'Nb Articles': sale.items.reduce((acc, item) => acc + item.quantity, 0),
        'Total TTC': sale.totalAmount,
        'Vendeur': sale.user?.email || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ventes");
      XLSX.writeFile(workbook, `rapport_ventes_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
       console.error("Export failure", error);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement des rapports...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto print:absolute print:inset-0 print:bg-white print:p-8">
      <div className="flex justify-between items-center mb-8 print:mb-4">
        <h1 className="text-3xl font-bold text-slate-800">Rapports & Analyses</h1>
        <div className="flex space-x-3 print:hidden">
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-600 text-white px-4 py-2 rounded shadow-sm hover:bg-emerald-700 flex items-center transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 flex items-center transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-center">
          <div className="text-slate-500 text-sm font-medium mb-1">Chiffre d'affaires Mensuel</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.monthRevenue.toFixed(2)} €</div>
          <div className="text-xs text-slate-400 mt-2">{stats?.monthSales} ventes traitées ce mois-ci</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-center">
          <div className="text-slate-500 text-sm font-medium mb-1">Chiffre d'affaires (Aujourd'hui)</div>
          <div className="text-3xl font-bold text-emerald-600">{stats?.todayRevenue.toFixed(2)} €</div>
          <div className="text-xs text-slate-400 mt-2">{stats?.todaySales} ventes aujourd'hui</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Évolution du CA (7 derniers jours)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} €`} />
              <Legend />
              <Bar dataKey="revenue" name="Chiffre d'affaires (€)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Évolution du Volume (7 derniers jours)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Nombre de tickets" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
