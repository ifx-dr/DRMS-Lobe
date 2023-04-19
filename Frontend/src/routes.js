import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import MainLayout from 'src/layouts/MainLayout';
import DashboardView from 'src/views/reports/DashboardView';
import LoginView from 'src/views/auth/LoginView';
import NotFoundView from 'src/views/errors/NotFoundView';
// import RegisterView from 'src/views/auth/RegisterView';
import CreateProposalView from 'src/views/settings/CreateProposalView';
import VetoProposalView from 'src/views/vetoproposal/VetoProposalView';
import ValidateProposal from 'src/views/vote/ValidateProposalView';
import BlockchainView from 'src/views/blockchain';
import GenerateBlockView from 'src/views/block';
const routes = [
  {
    path: 'app',
    element: <DashboardLayout />,
    children: [
      { path: 'login', element: <LoginView /> },
      { path: 'dashboard', element: <DashboardView /> },
      { path: 'createProposal', element: <CreateProposalView /> },
      { path: 'vetoProposal', element: <VetoProposalView />},
      { path: 'validateProposal', element: <ValidateProposal />},
      { path: 'generateBlock', element: <GenerateBlockView />},
      { path: 'blockchain', element: <BlockchainView />},
      { path: '*', element: <Navigate to="/404" /> }
    ]
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '404', element: <NotFoundView /> },
      { path: '/', element: <Navigate to="/app/dashboard" /> },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  }
];

export default routes;
