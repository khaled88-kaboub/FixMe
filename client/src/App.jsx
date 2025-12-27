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
import MaintenancePreventiveForm from "./pages/MaintenancePreventiveForm";
import Dashboard from "./pages/Dashboard";
import MaintenancePreventiveCalendar from "./pages/MaintenancePreventiveCalendar";
import MaintenancePreventiveList from "./pages/MaintenancePreventiveList";
import TimelineAnnuelle from "./pages/TimeLineAnnuelle";
import GanttAnnee from "./pages/GanttAnnee";
import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import InterventionPlist from "./pages/InterventionPlist";
import InterventionPDetails from "./pages/InterventionPDetails";
import MaintenancePreventiveCalendar2 from "./pages/MaintenancePreventiveCalendar2";
import { UserContext } from "./context/UserContext";
import ReleveCompteurPage from "./pages/ReleveCompteurPage";
import CompteurListPage from "./pages/CompteurListPage";
import AdminFournisseursPage from "./pages/AdminFournisseurPage";
import InterventionFournisseur from "../../server/models/InterventionFournisseur";




import "react-toastify/dist/ReactToastify.css";
import AdminInterventionFournisseur from "./pages/AdminInterventionFournisseur";




export default function App() {

  useEffect(() => {
    // ⚡ Connexion au backend Socket.IO
    const socket = io("http://fixme-1.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10
    });
  
    console.log("📡 Socket.IO connecté :", socket.id);
  
    // 🟡 Notification Maintenance Préventive arrivant à échéance
    socket.on("mp_due", (data) => {
      console.log("⚠️ Notification MP reçue :", data);
  
      toast.warning(
        `⚠️ ${data.message}\nÉquipement : ${data.equipement} — Ligne : ${data.ligne}\nDate : ${data.Date}`,
        { autoClose: 6000 }
      );
    });
  
    // 🔴 Gestion erreurs Socket (optionnel, conseillé)
    socket.on("connect_error", (err) => {
      console.error("❌ Erreur Socket.IO :", err.message);
    });
  
    // 🧹 Cleanup (obligatoire)
    return () => {
      console.log("🔌 Socket.IO déconnecté");
      socket.disconnect();
    };
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));

  


  return (
    <AuthProvider>
      <ToastContainer/>
      <UserContext.Provider value={{ user }}>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/users/F@sterD@y/2o2i" element={<UserManagementPage/>}/>
          <Route path="/int" element={<AdminInterventionPage/>}/>

          <Route path="/mpform" element={<MaintenancePreventiveForm/>}/>
          <Route path="/mpdash" element={<Dashboard/>}/>
          <Route path="/mplist" element={<MaintenancePreventiveList/>}/>
          <Route path="/mpcalendar" element={<MaintenancePreventiveCalendar/>}/>
          <Route path="/mpcalendar2" element={<MaintenancePreventiveCalendar2/>}/>
          <Route path="/mptimeline" element={<TimelineAnnuelle/>}/>
          <Route path="/mpgantt" element={<GanttAnnee/>}/>
          <Route path="/mpinterventions" element={<InterventionPlist/>}/>
          <Route path="/interventionP/:id" element={<InterventionPDetails />} />
          
          

          
          
          
          
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
              <Route path="compteurs/releve" element={<ReleveCompteurPage />} />
              <Route path="compteurs" element={<CompteurListPage />} />
              <Route path="fournisseurs" element={<AdminFournisseursPage />} />
              <Route path="intervention_fournisseur" element={<AdminInterventionFournisseur />} />
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
          <Route path="compteurs/releve" element={<ReleveCompteurPage />} />
          <Route path="compteurs" element={<CompteurListPage />} />
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
        </UserContext.Provider>
        <FooterNotification />
        

    </AuthProvider>
  );
}

