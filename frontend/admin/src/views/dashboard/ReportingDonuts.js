import React from 'react'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import { CChartDoughnut } from '@coreui/react-chartjs'

const ReportingDonuts = () => {
  return (
    <CRow className="mb-4">

      {/* ===================== */}
      {/* 1️⃣ Campagnes / Fiches */}
      {/* ===================== */}
      <CCol md={6}>
        <CCard className="shadow-sm">
          <CCardBody>
            <h5 className="fw-semibold mb-4">
              📊 Campagnes / Fiches
            </h5>

            <CChartDoughnut
              data={{
                labels: [
                  'BOUYGUES',
                  'KADEOS',
                  'EDENRED',
                  'TOTAL FLEET',
                  'CITROEN',
                ],
                datasets: [
                  {
                    data: [22, 18, 12, 26, 22],
                    backgroundColor: [
                      '#3b82f6',
                      '#10b981',
                      '#f59e0b',
                      '#8b5cf6',
                      '#ef4444',
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                cutout: '70%',
                maintainAspectRatio: false,
              }}
              style={{ height: '320px' }}
            />
          </CCardBody>
        </CCard>
      </CCol>

      {/* ===================== */}
      {/* 2️⃣ Répartition Produits */}
      {/* ===================== */}
      <CCol md={6}>
        <CCard className="shadow-sm">
          <CCardBody>
            <h5 className="fw-semibold mb-4">
              📦 Répartition par Produit
            </h5>

            <CChartDoughnut
              data={{
                labels: [
                  'Assurance Auto',
                  'Crédit Conso',
                  'Mutuelle',
                  'Assurance Santé',
                  'Assurance Pro',
                ],
                datasets: [
                  {
                    data: [34, 22, 16, 18, 10],
                    backgroundColor: [
                      '#2563eb',
                      '#10b981',
                      '#f59e0b',
                      '#8b5cf6',
                      '#ef4444',
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                cutout: '70%',
                maintainAspectRatio: false,
              }}
              style={{ height: '320px' }}
            />
          </CCardBody>
        </CCard>
      </CCol>

    </CRow>
  )
}

export default ReportingDonuts
