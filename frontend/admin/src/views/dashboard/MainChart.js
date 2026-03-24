import React from 'react'
import { CChartLine } from '@coreui/react-chartjs'

const MainChart = () => {
  const random = (min = 50, max = 200) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  return (
    <CChartLine
      style={{ height: '300px', marginTop: '40px' }}
      data={{
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Leads entrants',
            backgroundColor: 'rgba(59,130,246,0.15)', // bleu léger
            borderColor: '#3b82f6',
            borderWidth: 2,
            data: [
              random(),
              random(),
              random(),
              random(),
              random(),
              random(),
              random(),
            ],
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Leads qualifiés',
            backgroundColor: 'transparent',
            borderColor: '#10b981', // vert
            borderWidth: 2,
            data: [
              random(),
              random(),
              random(),
              random(),
              random(),
              random(),
              random(),
            ],
            tension: 0.4,
          },
          {
            label: 'Seuil',
            backgroundColor: 'transparent',
            borderColor: '#ef4444',
            borderDash: [6, 6],
            borderWidth: 1,
            data: [65, 65, 65, 65, 65, 65, 65],
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: {
              color: '#e5e7eb', // gris clair
              drawOnChartArea: false,
            },
            ticks: {
              color: '#6b7280', // gris texte
            },
          },
          y: {
            beginAtZero: true,
            max: 250,
            grid: {
              color: '#e5e7eb',
            },
            ticks: {
              color: '#6b7280',
              maxTicksLimit: 5,
            },
          },
        },
      }}
    />
  )
}

export default MainChart
