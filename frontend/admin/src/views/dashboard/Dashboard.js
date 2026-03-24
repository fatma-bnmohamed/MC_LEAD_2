import React from 'react'
import classNames from 'classnames'
import ReportingDonuts from './ReportingDonuts'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
  cilClock,
  cilCheckCircle,
  cilWarning,

} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
 import socket from "../../socket";
import { useEffect } from "react";

const Dashboard = () => {
 const params = new URLSearchParams(window.location.hash.split("?")[1]);

const token = params.get("token");
const userParam = params.get("user");

if (token) {
  localStorage.setItem("token", token);
}

if (userParam) {
  const user = JSON.parse(decodeURIComponent(userParam));
  localStorage.setItem("user", JSON.stringify(user));
}

useEffect(() => {

  console.log("Dashboard loaded");

  const params = new URLSearchParams(window.location.hash.split("?")[1]);
  const token = params.get("token");

  if (!token) {
    console.error("Token not found in URL");
    return;
  }

  function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  const decoded = parseJwt(token);
  const userId = decoded.id;

  console.log("User ID from token:", userId);

  localStorage.setItem("userId", userId);

  socket.connect();

  socket.on("connect", () => {

    console.log("Connected to socket server");
    console.log("Socket ID:", socket.id);

    socket.emit("join", userId);

  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

}, []);
  const progressExample = [
  { title: 'Leads entrants', value: '2 340', percent: 75, color: '#9ca3af' },
  { title: 'Conversion globale', value: '1 420', percent: 60,  color: '#9ca3af'  },
  { title: 'Conversion agent', value: '38%', percent: 38, color: '#9ca3af'  },
  { title: 'Taux rappel', value: '12%', percent: 12, color: 'danger' },
  { title: 'Leads qualifiés', value: '54%', percent: 54, color: 'primary' },
  
]

  const performanceAgents = [
  { title: 'Agent Sarra', leads: 42, conversions: 18 },
  { title: 'Agent Karim', leads: 35, conversions: 12 },
  { title: 'Agent Amal', leads: 28, conversions: 15 },
  { title: 'Agent Yassine', leads: 31, conversions: 9 },
]

 const progressQualite = [
  { title: 'Appels > 3 min', icon: cilClock, value: 62 },
  { title: 'Appels conformes script', icon: cilCheckCircle, value: 74 },
  { title: 'Appels à recontrôler', icon: cilWarning, value: 18 },
]


  const repartitionLeads = [
  { title: 'Qualifiés', percent: 54 },
  { title: 'En cours', percent: 26 },
  { title: 'Non intéressés', percent: 12 },
  { title: 'rejetés', percent: 8 },
]

  const tableExample = [
  {
    id: 'LD-001',
    client: 'Ahmed Ben Ali',
    produit: 'Assurance Auto',
    scoreIA: '92%',
    agent: 'Sarra M.',
    statut: 'Qualifié',
    date: 'Aujourd’hui',
  },
  {
    id: 'LD-002',
    client: 'Sami Trabelsi',
    produit: 'Crédit Conso',
    scoreIA: '81%',
    agent: 'Karim B.',
    statut: 'En cours',
    date: 'Hier',
  },
]

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4 mt-4">
        <CCardBody>
          
          <CRow>
            <CCol sm={5}>
              <h4 className="card-title mb-0">
  Performance des Leads
</h4>
<div className="small text-body-secondary">
  Suivi mensuel acquisition & qualification
</div>

            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Month'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {progressExample.map((item, index, items) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index + 1 === items.length,
                })}
                key={index}
              >
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold text-truncate">
                  {item.value} ({item.percent}%)
                </div>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>

      <WidgetsBrand className="mb-4" withCharts />
      <ReportingDonuts />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Traffic {' & '} Monitoring</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    
                  
                  </CRow>
                  <hr className="mt-0" />
                  <h6 className="fw-bold text-uppercase text-body-secondary mb-3">
                      Performance Agents
                    </h6>
                  {performanceAgents.map((item, index) => (
                      <div className="progress-group mb-4" key={index}>
                        <div className="progress-group-prepend">
                          <span className="text-body-secondary small">{item.title}</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress thin color="info" value={item.leads} />
                          <CProgress thin color="success" value={item.conversions} />
                        </div>
                      </div>
                    ))}
                </CCol>
                <CCol xs={12} md={6} xl={6}>
                 

                  <hr className="mt-0" />
                  <h6 className="fw-bold text-uppercase text-body-secondary mb-3">
                        Alertes système
                      </h6>
                  {progressQualite.map((item, index) => (
                      <div className="progress-group mb-4" key={index}>
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={item.icon} size="lg" />
                          <span>{item.title}</span>
                          <span className="ms-auto fw-semibold">{item.value}%</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress
                            thin
                            color={
                              item.title.includes('conformes')
                                ? 'success'
                                : item.title.includes('recontrôler')
                                ? 'danger'
                                : 'info'
                            }
                            value={item.value}
                          />
                        </div>
                      </div>
                    ))}

                  <div className="mb-5"></div>
                  <h6 className="fw-bold text-uppercase text-body-secondary mb-3 mt-4">
                      Qualifications Leads
                    </h6>

                  {repartitionLeads.map((item, index) => (
                      <div className="progress-group mb-4" key={index}>
                        <div className="progress-group-header">
                          <span>{item.title}</span>
                          <span className="ms-auto fw-semibold">{item.percent}%</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress thin color="primary" value={item.percent} />
                        </div>
                      </div>
                    ))}
                </CCol>
              </CRow>

              <br />

              <CTable align="middle" className="mb-0 border" hover responsive>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell>ID Lead</CTableHeaderCell>
      <CTableHeaderCell>Prospect</CTableHeaderCell>
      <CTableHeaderCell>Campagne</CTableHeaderCell>
      <CTableHeaderCell>Score IA</CTableHeaderCell>
      <CTableHeaderCell>Agent</CTableHeaderCell>
      <CTableHeaderCell>Statut</CTableHeaderCell>
      <CTableHeaderCell>Date</CTableHeaderCell>
    </CTableRow>
  </CTableHead>

  <CTableBody>
    {tableExample.map((item, index) => (
      <CTableRow key={index}>
        <CTableDataCell>{item.id}</CTableDataCell>
        <CTableDataCell>{item.client}</CTableDataCell>
        <CTableDataCell>{item.produit}</CTableDataCell>
        <CTableDataCell>
          <strong>{item.scoreIA}</strong>
        </CTableDataCell>
        <CTableDataCell>{item.agent}</CTableDataCell>
        <CTableDataCell>{item.statut}</CTableDataCell>
        <CTableDataCell>{item.date}</CTableDataCell>
      </CTableRow>
    ))}
  </CTableBody>
</CTable>

            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
    
  )
 
}

export default Dashboard
