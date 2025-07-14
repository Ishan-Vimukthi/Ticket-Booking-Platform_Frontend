import React, { useState } from 'react';
import { X } from 'lucide-react';

const SizeChart = ({ isOpen, onClose }) => {
  const sizeData = [
    {
      size: 'XS',
      chest: '32-34',
      length: '26',
      shoulder: '16',
      sleeve: '8'
    },
    {
      size: 'S',
      chest: '34-36',
      length: '27',
      shoulder: '17',
      sleeve: '8.5'
    },
    {
      size: 'M',
      chest: '36-38',
      length: '28',
      shoulder: '18',
      sleeve: '9'
    },
    {
      size: 'L',
      chest: '38-40',
      length: '29',
      shoulder: '19',
      sleeve: '9.5'
    },
    {
      size: 'XL',
      chest: '40-42',
      length: '30',
      shoulder: '20',
      sleeve: '10'
    },
    {
      size: 'XXL',
      chest: '42-44',
      length: '31',
      shoulder: '21',
      sleeve: '10.5'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Size Chart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Size Guide Image/Illustration */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="inline-block relative">
                {/* Simple T-shirt illustration using CSS */}
                <div className="w-48 h-48 mx-auto relative">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full text-gray-400"
                    fill="currentColor"
                  >
                    {/* T-shirt shape */}
                    <path d="M60 50 L60 30 L140 30 L140 50 L170 50 L170 80 L160 80 L160 170 L40 170 L40 80 L30 80 L30 50 Z" />
                  </svg>
                  
                  {/* Measurement lines and labels */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xs text-gray-600 space-y-2">
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                        <div className="text-center">
                          <div className="w-16 h-px bg-gray-400 mb-1"></div>
                          <span>Shoulder</span>
                        </div>
                      </div>
                      <div className="absolute top-1/3 -left-8">
                        <div className="text-center rotate-90">
                          <div className="w-12 h-px bg-gray-400 mb-1"></div>
                          <span>Chest</span>
                        </div>
                      </div>
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="text-center">
                          <div className="w-px h-16 bg-gray-400 mb-1 mx-auto"></div>
                          <span>Length</span>
                        </div>
                      </div>
                      <div className="absolute top-1/4 -right-8">
                        <div className="text-center -rotate-90">
                          <div className="w-8 h-px bg-gray-400 mb-1"></div>
                          <span>Sleeve</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Measurement Instructions */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">How to Measure</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.
              </div>
              <div>
                <strong>Length:</strong> Measure from the highest point of the shoulder to the bottom hem.
              </div>
              <div>
                <strong>Shoulder:</strong> Measure from shoulder point to shoulder point across the back.
              </div>
              <div>
                <strong>Sleeve:</strong> Measure from the shoulder seam to the cuff.
              </div>
            </div>
          </div>

          {/* Size Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-4 text-left font-semibold">Size</th>
                  <th className="p-4 text-center font-semibold">Chest (inches)</th>
                  <th className="p-4 text-center font-semibold">Length (inches)</th>
                  <th className="p-4 text-center font-semibold">Shoulder (inches)</th>
                  <th className="p-4 text-center font-semibold">Sleeve (inches)</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((row, index) => (
                  <tr
                    key={row.size}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-25' : 'bg-white'
                    }`}
                  >
                    <td className="p-4 font-semibold text-gray-900">{row.size}</td>
                    <td className="p-4 text-center text-gray-700">{row.chest}</td>
                    <td className="p-4 text-center text-gray-700">{row.length}</td>
                    <td className="p-4 text-center text-gray-700">{row.shoulder}</td>
                    <td className="p-4 text-center text-gray-700">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional Notes */}
          <div className="mt-6 text-sm text-gray-600 space-y-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">📏 Sizing Notes:</h4>
              <ul className="space-y-1 text-yellow-700">
                <li>• All measurements are in inches</li>
                <li>• Measurements may vary by ±0.5 inches</li>
                <li>• For the best fit, compare these measurements to a shirt that fits you well</li>
                <li>• If you're between sizes, we recommend sizing up for a more comfortable fit</li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChart;
