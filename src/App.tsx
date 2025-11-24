// import { Routing } from "./routes/Routes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from "./components/landingPage/LandingComp";
import Dashboard from "./components/dashboard/Dashboard";
import Projects from "./components/projects/Projects";
import { DashboardLayout } from "./layout/DashboardLayout";
import { ROUTES_ENUM } from "./constants/routes.constant";
import { AuthLayout } from "./layout/AuthLayout";
import { ResetPassword } from "./components/auth/components/ResetPassword";
import { OTP } from "./components/auth/components/Otp";
import { CreatePassword } from "./components/auth/components/CreatePassword";
import { PasswordChange } from "./components/auth/components/PasswordChange";
import { LoginAndSignUp } from "./components/auth/components/LoginAndSignUpLayout";
import { SessionProvider } from "./sessionManager/SessionContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Trades from "./components/trades/Trades";
import Bids from "./components/bids/Bids";
import BidDetails from "./components/bids/BidDetails";
import BidComparison from "./components/bids/BidComparison";
import Files from "./components/files/Files";
import Teams from "./components/teams/Teams";

function App() {
  return (
    <>
      <BrowserRouter>
        <SessionProvider>
          <Routes>
            <Route path={ROUTES_ENUM.ROOT} element={<Landing />} />
            <Route element={<AuthLayout />}>
              <Route path={ROUTES_ENUM.LOGIN} element={<LoginAndSignUp />} />
              <Route
                index
                path={ROUTES_ENUM.PASS_CHANGE}
                element={<PasswordChange />}
              />
              <Route
                path={ROUTES_ENUM.CRE_PASSWORD}
                element={<CreatePassword />}
              />
              <Route path={ROUTES_ENUM.OPT} element={<OTP />} />
              <Route
                path={ROUTES_ENUM.RES_PASSWORD}
                element={<ResetPassword />}
              />
            </Route>
            <Route path={"/"} element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path={ROUTES_ENUM.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES_ENUM.PROJECTS} element={<Projects />} /> 
              <Route path={ROUTES_ENUM.TRADES} element={<Trades />} />
              <Route path={`${ROUTES_ENUM.BIDS}/:tradeId`} element={<Bids />} />
              <Route path={`${ROUTES_ENUM.BID_DETAILS}/:tradeId/:bidId`} element={<BidDetails />} />
              <Route path={ROUTES_ENUM.BID_COMPARISON} element={<BidComparison />} />
              <Route path={ROUTES_ENUM.FILES} element={<Files />} />
              <Route path={ROUTES_ENUM.TEAMS} element={<Teams />} />
            </Route>
          </Routes>
        </SessionProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
