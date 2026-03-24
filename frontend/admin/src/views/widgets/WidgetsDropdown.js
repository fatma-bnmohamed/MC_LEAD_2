import React from 'react'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilCheckCircle,
  cilClock,
  cilXCircle,
  cilBriefcase,
  cilPeople,
} from '@coreui/icons'

const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #E5E7EB',
  borderRadius: '10px',
  transition: '0.2s',
}

const titleStyle = {
  color: '#9CA3AF',
  fontSize: '14px',
}

const valueStyle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#111827',
}

const WidgetsDropdown = () => {
  return (
    <>
      {/* ===== TOP 4 CARDS ===== */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard style={cardStyle}>
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div style={titleStyle}>Total Leads</div>
                  <div style={valueStyle}>1 248</div>
                  <div style={{ color: '#16A34A', fontSize: '14px' }}>
                    +12% ce mois
                  </div>
                </div>
                <CIcon icon={cilUser} size="xl" style={{ color: '#3B82F6' }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard style={cardStyle}>
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div style={titleStyle}>Leads qualifiés</div>
                  <div style={valueStyle}>642</div>
                  <div style={{ color: '#16A34A', fontSize: '14px' }}>
                    +8%
                  </div>
                </div>
                <CIcon icon={cilCheckCircle} size="xl" style={{ color: '#22C55E' }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard style={cardStyle}>
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div style={titleStyle}>Nouveaux Leads</div>
                  <div style={valueStyle}>87</div>
                  <div style={{ color: '#DC2626', fontSize: '14px' }}>
                    -3%
                  </div>
                </div>
                <CIcon icon={cilClock} size="xl" style={{ color: '#F59E0B' }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6} lg={3}>
          <CCard style={cardStyle}>
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div style={titleStyle}>Leads rejetés</div>
                  <div style={valueStyle}>124</div>
                  <div style={{ color: '#DC2626', fontSize: '14px' }}>
                    +5%
                  </div>
                </div>
                <CIcon icon={cilXCircle} size="xl" style={{ color: '#EF4444' }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ===== SECOND ROW (2 LARGE CARDS) ===== */}
      <CRow>
        <CCol md={6}>
          <CCard style={cardStyle}>
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div style={titleStyle}>Campagnes actives</div>
                  <div style={valueStyle}>8</div>
                  <div style={{ color: '#3B82F6', fontSize: '14px' }}>
                    78% budget utilisé
                  </div>
                </div>
                <CIcon icon={cilBriefcase} size="xl" style={{ color: '#3B82F6' }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard style={cardStyle}>
            <CCardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <div style={titleStyle}>Agents actifs</div>
                  <div style={valueStyle}>12</div>
                  <div style={{ color: '#16A34A', fontSize: '14px' }}>
                    124 appels traités
                  </div>
                </div>
                <CIcon icon={cilPeople} size="xl" style={{ color: '#22C55E' }} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default WidgetsDropdown
