import React from 'react'
import { hasPermission } from "./utils/permissions";
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
  cilLayers,
  cilSettings,
  cilList,
  cilChart,
  cilBolt,
  cilHistory,
  cilCreditCard,
  cilClock,
  cibMyspace,
  cilPeople
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [

  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} className="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Gestion',
  },

  //  USERS
  hasPermission("users","view") && {
    component: CNavItem,
    name: 'Utilisateurs',
    to: '/users',
    icon: <CIcon icon={cilUser} className="nav-icon" />,
  },

  //  USER GROUP
  hasPermission("users_groups","view") && {
    component: CNavItem,
    name: 'Groupes Utilisateurs',
    to: '/usergroup',
    icon: <CIcon icon={cibMyspace} size="lg" className="nav-icon" />,
  },

  //  CAMPAGNES
 hasPermission("campaigns","view") && {
  component: CNavItem,
  name: 'Campagnes',
  to: '/companies', // ✅ CORRECT
  icon: <CIcon icon={cilLayers} className="nav-icon" />,
},

 

  //  LEADS
 hasPermission("leads","view") && {
  component: CNavGroup,
  name: 'Leads',
  icon: <CIcon icon={cilList} className="nav-icon" />,
  
  items: [

    {
      component: CNavItem,
      name: 'All Leads',
      to: '/leads', // page principale
    },

    {
      component: CNavItem,
      name: 'Nouveau Lead',
      to: '/leads/new',
    },

    {
      component: CNavItem,
      name: 'Closed Leads',
      to: '/leads/closed',
    },

  ],
},

  {
    component: CNavTitle,
    name: 'Analyse & Contrôle',
  },

  hasPermission("reporting","view") && {
    component: CNavItem,
    name: 'Reporting',
    to: '/reporting',
    icon: <CIcon icon={cilChart} className="nav-icon" />,
  },

  hasPermission("automatisations","view") && {
    component: CNavItem,
    name: 'Automatisations',
    to: '/automatisations',
    icon: <CIcon icon={cilBolt} className="nav-icon" />,
  },

  hasPermission("audit","view") && {
    component: CNavItem,
    name: 'Audit',
    to: '/audit',
    icon: <CIcon icon={cilHistory} className="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Finance & RH',
  },

  hasPermission("facturation","view") && {
    component: CNavItem,
    name: 'Facturation',
    to: '/facturation',
    icon: <CIcon icon={cilCreditCard} className="nav-icon" />,
  },

  hasPermission("pointage","view") && {
    component: CNavItem,
    name: 'Pointage',
    to: '/pointage',
    icon: <CIcon icon={cilClock} className="nav-icon" />,
  },

   {
    component: CNavTitle,
    name: 'Paramétres',
  },


   //  Profils
  hasPermission("profils","view") && {
    component: CNavItem,
    name: 'Profils',
    to: '/profils',
    icon: <CIcon icon={cilPeople} className="nav-icon" />,
  },

// 🔐 PERMISSIONS
  hasPermission("permissions","view") && {
    component: CNavItem,
    name: 'Permissions',
    to: '/permissions',
    icon: <CIcon icon={cilSettings} className="nav-icon" />,
  },

  hasPermission("custom_fields","view") && {
  component: CNavItem,
  name: 'Champs personnalisés',
  to: '/custom-fields',
  icon: <CIcon icon={cilList} className="nav-icon" />,
},

].filter(Boolean); 

export default _nav;