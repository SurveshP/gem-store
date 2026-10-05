import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'

/* ------------------ DATA ------------------ */

const barDataOptions = {
  Day: [
    { name: 'Gold', sales: 1 },
    { name: 'Diamond', sales: 0.5 },
    { name: 'Silver', sales: 0.8 },
    { name: 'Rings', sales: 1.2 },
  ],
  Week: [
    { name: 'Gold', sales: 4 },
    { name: 'Diamond', sales: 2 },
    { name: 'Silver', sales: 3 },
    { name: 'Rings', sales: 5 },
  ],
  Month: [
    { name: 'Gold', sales: 15 },
    { name: 'Diamond', sales: 8 },
    { name: 'Silver', sales: 12 },
    { name: 'Rings', sales: 18 },
  ],
  Year: [
    { name: 'Gold', sales: 120 },
    { name: 'Diamond', sales: 90 },
    { name: 'Silver', sales: 100 },
    { name: 'Rings', sales: 150 },
  ],
}

const pieDataOptions = {
  Day: [
    { name: 'Delivered', value: 5 },
    { name: 'Pending', value: 2 },
    { name: 'Processing', value: 1 },
  ],
  Week: [
    { name: 'Delivered', value: 20 },
    { name: 'Pending', value: 10 },
    { name: 'Processing', value: 5 },
    { name: 'Cancelled', value: 2 },
  ],
  Month: [
    { name: 'Delivered', value: 60 },
    { name: 'Pending', value: 20 },
    { name: 'Processing', value: 10 },
    { name: 'Cancelled', value: 5 },
    { name: 'Returned', value: 5 },
  ],
  Year: [
    { name: 'Delivered', value: 500 },
    { name: 'Pending', value: 200 },
    { name: 'Processing', value: 120 },
    { name: 'Cancelled', value: 80 },
    { name: 'Returned', value: 100 },
  ],
}

const COLORS = ['#facc15', '#a1a1aa', '#fde68a', '#71717a', '#e4e4e7']

/* ------------------ COMPONENT ------------------ */

const Charts = () => {
  const [barFilter, setBarFilter] = useState('Month')
  const [pieFilter, setPieFilter] = useState('Month')

  return (
    <>
      <style>{`
        .gem-chart-card {
          background: linear-gradient(160deg, #18181b 0%, #0f0f12 100%);
          border: 1px solid rgba(250, 204, 21, 0.15);
          border-radius: 1rem;
          padding: 1.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          height: 100%;
        }
        .gem-chart-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(250, 204, 21, 0.15);
        }
        .gem-chart-title {
          color: #facc15;
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.3px;
        }
        .gem-chart-sub {
          color: #71717a;
          font-size: 0.75rem;
          margin: 0;
        }
        .gem-filter-select {
          background-color: #0a0a0b;
          color: #facc15;
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 0.5rem;
          padding: 0.35rem 0.7rem;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease;
        }
        .gem-filter-select:hover,
        .gem-filter-select:focus {
          border-color: #facc15;
          box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.15);
        }
        .gem-filter-select option {
          background: #0a0a0b;
          color: #facc15;
        }
      `}</style>

      <div className="container-fluid px-3 px-sm-4 px-lg-5 py-4">
        <div className="row g-4">

          {/* ----------- BAR CHART ----------- */}
          <div className="col-12 col-xl-6">
            <div className="gem-chart-card">
              <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="gem-chart-title">Sales by Category</h5>
                  <p className="gem-chart-sub">Jewellery sales overview</p>
                </div>
                <select
                  value={barFilter}
                  onChange={(e) => setBarFilter(e.target.value)}
                  className="gem-filter-select"
                >
                  <option>Day</option>
                  <option>Week</option>
                  <option>Month</option>
                  <option>Year</option>
                </select>
              </div>

              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barDataOptions[barFilter]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(250, 204, 21, 0.1)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#a1a1aa"
                      tick={{ fontSize: 11, fill: '#a1a1aa' }}
                      axisLine={{ stroke: 'rgba(250, 204, 21, 0.2)' }}
                    />
                    <YAxis
                      stroke="#a1a1aa"
                      tick={{ fontSize: 11, fill: '#a1a1aa' }}
                      axisLine={{ stroke: 'rgba(250, 204, 21, 0.2)' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(250, 204, 21, 0.06)' }}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(250, 204, 21, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#facc15', fontWeight: 600 }}
                      itemStyle={{ color: '#facc15' }}
                    />
                    <Bar dataKey="sales" fill="#facc15" radius={[8, 8, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ----------- PIE CHART ----------- */}
          <div className="col-12 col-xl-6">
            <div className="gem-chart-card">
              <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="gem-chart-title">Order Status</h5>
                  <p className="gem-chart-sub">Distribution of orders</p>
                </div>
                <select
                  value={pieFilter}
                  onChange={(e) => setPieFilter(e.target.value)}
                  className="gem-filter-select"
                >
                  <option>Day</option>
                  <option>Week</option>
                  <option>Month</option>
                  <option>Year</option>
                </select>
              </div>

              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataOptions[pieFilter]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      stroke="#0f0f12"
                      strokeWidth={2}
                    >
                      {pieDataOptions[pieFilter].map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(250, 204, 21, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#facc15', fontWeight: 600 }}
                      itemStyle={{ color: '#facc15' }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '0.78rem', color: '#a1a1aa' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Charts