import React from 'react'
import PropTypes from 'prop-types'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilUserX, cilSettings, cilSync } from '@coreui/icons'

const WidgetsBrand = ({ className }) => {
  return (
    <CRow className={className} xs={{ gutter: 4 }}>

      {/* Rejets Qualité */}
      <CCol sm={6} xl={4} xxl={3}>
        <CCard className="shadow-sm border h-100">
          <CCardBody className="d-flex justify-content-between align-items-start">
            <div>
              <div style={{ color: '#9ca3af' }}>Rejets Qualité</div>
              <div className="fs-4 fw-bold">100</div>
              <div className="small text-danger">+5% ce mois</div>
            </div>
            <CIcon icon={cilWarning} size="lg" className="text-danger" />
          </CCardBody>
        </CCard>
      </CCol>

      {/* Rejets Agent */}
      <CCol sm={6} xl={4} xxl={3}>
        <CCard className="shadow-sm border h-100">
          <CCardBody className="d-flex justify-content-between align-items-start">
            <div>
              <div style={{ color: '#9ca3af' }}>Rejets Agent</div>
              <div className="fs-4 fw-bold">85</div>
              <div className="small text-warning">-3%</div>
            </div>
            <CIcon icon={cilUserX} size="lg" className="text-warning" />
          </CCardBody>
        </CCard>
      </CCol>

      {/* Rejets IA */}
      <CCol sm={6} xl={4} xxl={3}>
        <CCard className="shadow-sm border h-100">
          <CCardBody className="d-flex justify-content-between align-items-start">
            <div>
              <div style={{ color: '#9ca3af' }}>Rejets IA</div>
              <div className="fs-4 fw-bold">124</div>
              <div className="small text-info">Stable</div>
            </div>
            <CIcon icon={cilSettings} size="lg" className="text-info" />
          </CCardBody>
        </CCard>
      </CCol>

      {/* Divergences */}
      <CCol sm={6} xl={4} xxl={3}>
        <CCard className="shadow-sm border h-100">
          <CCardBody className="d-flex justify-content-between align-items-start">
            <div>
              <div style={{ color: '#9ca3af' }}>Divergences IA / Agent</div>
              <div className="fs-4 fw-bold">4</div>
              <div className="small text-primary">-1 vs mois dernier</div>
            </div>
            <CIcon icon={cilSync} size="lg" className="text-primary" />
          </CCardBody>
        </CCard>
      </CCol>

    </CRow>
  )
}

WidgetsBrand.propTypes = {
  className: PropTypes.string,
}

export default WidgetsBrand
