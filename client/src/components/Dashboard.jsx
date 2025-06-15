import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';

const PARAMETER_OPTIONS = [
  { key: 'BOD', label: 'BOD' },
  { key: 'COD', label: 'COD' },
  { key: 'pH', label: 'pH' },
  { key: 'TDS', label: 'TDS' },
  { key: 'DO', label: 'DO' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'turbidity', label: 'Turbidity' },
  // Add more as needed
];

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedParam, setSelectedParam] = useState('BOD');

  useEffect(() => {
    axios.get('/api/samples/all')
      .then(res => {
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else if (res.data && typeof res.data === 'object') {
          setData([res.data]);
        } else {
          setData([]);
        }
      })
      .catch(() => setData([]));
  }, []);

  const safeData = Array.isArray(data) ? data : [];

  // Extract unique method names
  const methodNames = Array.from(new Set(safeData.map(entry => entry.method?.name).filter(Boolean)));

  // Group by batchId and stage
  const batches = {};
  safeData.forEach(entry => {
    if (!entry.method || !entry.sampleMeta) return;
    if (selectedMethod && entry.method.name !== selectedMethod) return;
    const batchId = entry.sampleMeta.batchId;
    if (!batches[batchId]) batches[batchId] = {};
    batches[batchId][entry.sampleMeta.stage] = entry;
  });

  // Prepare before/after comparison data for selected parameter
  const beforeAfterChartData = Object.entries(batches).map(([batchId, stages]) => {
    const beforeVal = stages.before?.measurements?.waterQuality?.[selectedParam];
    const afterVal = stages.after?.measurements?.waterQuality?.[selectedParam];
    if (beforeVal === undefined && afterVal === undefined) return null;
    return {
      batch: batchId,
      Before: beforeVal,
      After: afterVal
    };
  }).filter(Boolean);

  // Helper to extract number from MongoDB extended JSON
  const extractNumber = v => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return parseFloat(v);
    if (v && typeof v === 'object') {
      if ('$numberInt' in v) return parseInt(v['$numberInt'], 10);
      if ('$numberDouble' in v) return parseFloat(v['$numberDouble']);
      if ('$numberLong' in v) return parseInt(v['$numberLong'], 10);
    }
    return null;
  };

  // Dye before/after chart by batch
  const dyeBeforeAfterChartData = Object.entries(batches).map(([batchId, stages]) => {
    const beforeDye = stages.before?.measurements?.dye;
    const afterDye = stages.after?.measurements?.dye;
    if (!beforeDye && !afterDye) return null;
    return {
      batch: batchId,
      Initial: beforeDye?.initialConcentration ?? null,
      Final: afterDye?.finalConcentration ?? null
    };
  }).filter(d => d && d.Initial !== null && d.Final !== null);

  // Color removal efficiency by batch
  const colorRemovalChartData = Object.entries(batches).map(([batchId, stages]) => {
    const beforeDye = stages.before?.measurements?.dye;
    const afterDye = stages.after?.measurements?.dye;
    if (!beforeDye || !afterDye || !beforeDye.absorbanceInitial || !afterDye.absorbanceFinal) return null;
    const removal = beforeDye.absorbanceInitial !== 0
      ? ((beforeDye.absorbanceInitial - afterDye.absorbanceFinal) / beforeDye.absorbanceInitial) * 100
      : null;
    return {
      batch: batchId,
      ColorRemoval: removal !== null ? Math.round(removal * 100) / 100 : null
    };
  }).filter(d => d && d.ColorRemoval !== null);

  // Timeline data for selected method and parameter (only 'after' samples)
  const timelineData = safeData
    .filter(entry =>
      entry.method && entry.sampleMeta &&
      entry.method.name === selectedMethod &&
      entry.sampleMeta.stage === 'after' &&
      entry.measurements && entry.measurements.waterQuality &&
      entry.measurements.waterQuality[selectedParam] !== undefined
    )
    .map(entry => ({
      timestamp: entry.sampleMeta.timestamp,
      value: entry.measurements.waterQuality[selectedParam],
      batch: entry.sampleMeta.batchId
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Method selection dropdown */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="method-select">Select Method: </label>
        <select
          id="method-select"
          value={selectedMethod}
          onChange={e => setSelectedMethod(e.target.value)}
        >
          <option value="">All Methods</option>
          {methodNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      {/* Parameter selection dropdown */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="param-select">Compare Parameter: </label>
        <select
          id="param-select"
          value={selectedParam}
          onChange={e => setSelectedParam(e.target.value)}
        >
          {PARAMETER_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>
      {/* Before/After Comparison Chart */}
      <div>
        <h2>Before/After Comparison ({selectedParam})</h2>
        {beforeAfterChartData.length === 0 ? (
          <p>No data available for this method/parameter.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={beforeAfterChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Before" fill="#8884d8" />
              <Bar dataKey="After" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div>
        <h2>Dye Concentration (Before/After by Batch)</h2>
        {dyeBeforeAfterChartData.length === 0 ? (
          <p>No dye concentration data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dyeBeforeAfterChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Initial" fill="#8884d8" />
              <Bar dataKey="Final" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div>
        <h2>Color Removal Efficiency (by Batch)</h2>
        {colorRemovalChartData.length === 0 ? (
          <p>No color removal data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={colorRemovalChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ColorRemoval" fill="#ff7f50" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Timeline Chart */}
      <div>
        <h2>Timeline ({selectedParam}) for {selectedMethod || '...'}</h2>
        {selectedMethod && timelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={t => new Date(t).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={t => new Date(t).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="value" name={selectedParam} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No timeline data for this method/parameter.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
