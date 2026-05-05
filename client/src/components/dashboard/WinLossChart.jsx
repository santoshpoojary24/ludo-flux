import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const WinLossChart = () => {
  const { token } = useGameStore();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return undefined;

    let ignore = false;

    const destroyChart = () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };

    const renderChart = (points) => {
      const Chart = window.Chart;
      if (!canvasRef.current || !Chart) return;

      destroyChart();

      chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: points.map((point) =>
            new Date(point.day).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            })
          ),
          datasets: [
            {
              label: 'Wins',
              data: points.map((point) => point.wins),
              backgroundColor: '#22c55e',
              borderRadius: 8,
              borderSkipped: false,
              maxBarThickness: days === 7 ? 18 : 10
            },
            {
              label: 'Losses',
              data: points.map((point) => point.losses),
              backgroundColor: '#ef4444',
              borderRadius: 8,
              borderSkipped: false,
              maxBarThickness: days === 7 ? 18 : 10
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b',
                font: {
                  weight: '700',
                  size: 10
                }
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                stepSize: 1,
                color: '#64748b',
                font: {
                  weight: '700',
                  size: 10
                }
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.18)',
                drawBorder: false
              }
            }
          }
        }
      });
    };

    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/matches/stats?days=${days}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }

        const data = await response.json();
        if (!ignore) {
          renderChart(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch win/loss chart data', error);
        if (!ignore) {
          destroyChart();
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      ignore = true;
      destroyChart();
    };
  }, [days, token]);

  return (
    <section
      style={{
        width: '100%',
        background: 'var(--surface)',
        borderRadius: 22,
        padding: 18,
        boxShadow: 'var(--shadow-out)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text)', fontWeight: 900, fontSize: 16 }}>
            Win/Loss Chart
          </h3>
          <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }}>
            Daily results over the last {days} days
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: 4,
            borderRadius: 14,
            background: 'var(--surface2)',
            boxShadow: 'var(--shadow-in)'
          }}
        >
          {[7, 30].map((value) => (
            <button
              key={value}
              onClick={() => setDays(value)}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: '8px 12px',
                background: value === days ? 'var(--accent)' : 'transparent',
                color: value === days ? '#fff' : 'var(--text-muted)',
                fontWeight: 900,
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              {value}D
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', height: 220 }}>
        {loading ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 16,
              zIndex: 1
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '3px solid rgba(148, 163, 184, 0.25)',
                borderTopColor: 'var(--accent)',
                animation: 'chart-spin 0.8s linear infinite'
              }}
            />
          </div>
        ) : null}
        <canvas ref={canvasRef} />
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
          Wins
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11, fontWeight: 800 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          Losses
        </div>
      </div>

      <style>{`
        @keyframes chart-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default WinLossChart;
