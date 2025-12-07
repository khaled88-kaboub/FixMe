import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewInterventionPage from "./pages/NewInterventionPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AdminLignesPage from "./pages/AdminLignesPage";
import AdminEquipementPage from "./pages/AdminEquipementPage";
import AdminInterventionPage from "./pages/AdminInterventionPage";
import AdminUpdateStatutPage from "./pages/AdminUpdateStatutPage";
import FooterNotification from "./pages/FooterNotification";
import MaintenanceGridPage from "./pages/MaintenanceGridPage";
import InterventionReportPage from "./pages/InterventionReportPage";
import TechniciensPage from "./pages/TechniciensPage";
import ListeReportPage from "./pages/ListeReportPage";
import UserManagementPage from "./pages/UserManagementPage";
import InterventionReceptionMaintenance from "./pages/InterventionReceptionMaintenance";
import InterventionReceptionProduction from "./pages/InterventionReceptionProduction";
import MenuAdminPage from "./pages/MenuAdminPage";
import MenuMaintenancePage from "./pages/MenuMaintenancePage";
import MenuProductionPage from "./pages/MenuProductionPage";
import MenuMethodePage from "./pages/MenuMethodePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import Didetails from "./pages/Didetails"
import Arret from "./pages/Arret";
import IntervenantStat from "./pages/IntervenantStat";
import ListDi from "./pages/ListDi"
import InterventionAnnulerPage from "./pages/InterventionAnnulerPage";
import InterventionEtRapport from "./pages/InterventionEtRapport";






export default function App() {
  return (
    <AuthProvider>
      
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/users/F@sterD@y/2o2i" element={<UserManagementPage/>}/>
          <Route path="/int" element={<AdminInterventionPage/>}/>
          
          
          
          
          
     {/* --- PROTÉGÉES PAR RÔLE --- */}

        {/* --- Role Admin --- */}
          <Route
               path="/menuadminpage"
               element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MenuAdminPage />
              </ProtectedRoute>
              }
             >
              <Route path="lignes" element={<AdminLignesPage />} />
              <Route path="equipements" element={<AdminEquipementPage />} />
              <Route path="techniciens" element={<TechniciensPage/>}/>
              <Route path="users" element={<UserManagementPage/>}/>
              <Route path="arret" element={<Arret/>}/>
              <Route path="intervenant-stat" element={<IntervenantStat/>}/>
              <Route path="tous" element={<InterventionEtRapport/>}/>
              <Route path="rapport-interventions" element={<ListeReportPage/>}/>
              <Route path="demande-interventions" element={<AdminInterventionPage/>}/>
             </Route>

        {/* --- Role Maintenance --- */} 
          <Route
            path="/menumaintenancepage"
            element={
              <ProtectedRoute allowedRoles={["maintenance"]}>
                <MenuMaintenancePage />
                
              </ProtectedRoute>
            }
          >
          <Route path="grid" element={<MaintenanceGridPage/>} />
          <Route path="maintenance-cloture" element={<InterventionReceptionMaintenance/>}/>
          <Route path="intervention/:id" element={<InterventionReportPage/>} />
          </Route>
         
         {/* --- Role Méthodes --- */} 
         <Route
            path="/menumethodepage"
            element={
              <ProtectedRoute allowedRoles={["methode"]}>
                <MenuMethodePage />
                
              </ProtectedRoute>
            }
          >
          <Route path="status" element={<AdminUpdateStatutPage/>} />
          <Route path="arret" element={<Arret/>}/>
          <Route path="intervenant-stat" element={<IntervenantStat/>}/>
          <Route path="lignes" element={<AdminLignesPage />} />
          <Route path="equipements" element={<AdminEquipementPage />} />
          <Route path="techniciens" element={<TechniciensPage/>}/>
          </Route>
         {/* --- Role Production --- */}
          <Route
            path="/menuproductionpage"
            element={
              <ProtectedRoute allowedRoles={["production"]}>
                <MenuProductionPage />
              </ProtectedRoute>
            }
          > 
          <Route path="interventions" element={<NewInterventionPage />} />
          <Route path="production-reception" element={<InterventionReceptionProduction/>}/>
          <Route path="canceldi" element={<InterventionAnnulerPage/>}/>
          <Route path="di" element={<ListDi/>}/>
          </Route>
          <Route
            path="/menumethodepage"
            element={
              <ProtectedRoute allowedRoles={["methode"]}>
                <MenuMethodePage />
              </ProtectedRoute>
            }
          />

          {/* --- OPTIONNEL : PAGE PAR DÉFAUT --- */}
          <Route path="/" element={<LoginPage />} />



          {/* Tu pourras ajouter la liste des interventions ici */}
        </Routes>
        <FooterNotification />
        

    </AuthProvider>
  );
}

