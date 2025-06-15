import React, { useState } from 'react';
import axios from 'axios';

const FormPage = () => {
  const [formData, setFormData] = useState({
    location: '',
    treatmentMethod: '',
    waterQuality: {
      before: {
        pH: '', temperature: '', turbidity: '', DO: '', BOD: '', COD: '', TDS: '',
      },
      after: {
        pH: '', temperature: '', turbidity: '', DO: '', BOD: '', COD: '', TDS: '',
      },
    },
    dyeParameters: {
      dyeName: '',
      initialConcentration: '',
      finalConcentration: '',
      absorbanceBefore: '',
      absorbanceAfter: '',
    },
    heavyMetals: {
      before: {
        Cr: '', Pb: '', Nitrates: '', Ammonia: '',
      },
      after: {
        Cr: '', Pb: '', Nitrates: '', Ammonia: '',
      },
    },
  });

  const handleChange = (e, section, subSection, field) => {
    const value = e.target.value;
    if (subSection) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: {
            ...prev[section][subSection],
            [field]: value,
          },
        },
      }));
    } else if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/samples', formData);
      alert('Sample submitted!');
    } catch (err) {
      alert('Error submitting sample');
    }
  };

  return (
    <div>
      <h1>Sample Entry Form</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Location" value={formData.location} onChange={e => handleChange(e, null, null, 'location')} />
        <input type="text" placeholder="Treatment Method" value={formData.treatmentMethod} onChange={e => handleChange(e, null, null, 'treatmentMethod')} />
        <h2>Water Quality - Before</h2>
        {Object.entries(formData.waterQuality.before).map(([k, v]) => (
          <input key={`wb-${k}`} type="number" placeholder={k} value={v} onChange={e => handleChange(e, 'waterQuality', 'before', k)} />
        ))}
        <h2>Water Quality - After</h2>
        {Object.entries(formData.waterQuality.after).map(([k, v]) => (
          <input key={`wa-${k}`} type="number" placeholder={k} value={v} onChange={e => handleChange(e, 'waterQuality', 'after', k)} />
        ))}
        <h2>Dye Parameters</h2>
        {Object.entries(formData.dyeParameters).map(([k, v]) => (
          <input key={k} type={k === 'dyeName' ? 'text' : 'number'} placeholder={k} value={v} onChange={e => handleChange(e, 'dyeParameters', null, k)} />
        ))}
        <h2>Heavy Metals - Before</h2>
        {Object.entries(formData.heavyMetals.before).map(([k, v]) => (
          <input key={`hmb-${k}`} type="number" placeholder={k} value={v} onChange={e => handleChange(e, 'heavyMetals', 'before', k)} />
        ))}
        <h2>Heavy Metals - After</h2>
        {Object.entries(formData.heavyMetals.after).map(([k, v]) => (
          <input key={`hma-${k}`} type="number" placeholder={k} value={v} onChange={e => handleChange(e, 'heavyMetals', 'after', k)} />
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FormPage;
