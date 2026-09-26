import React from 'react';
import Header from './components/sections/Header.js';
import Hero from './components/sections/Hero.js';
import MercadoHoje from './components/sections/MercadoHoje.js';
import PlatformOverview from './components/sections/PlatformOverview.js';
import CompanyAnalysis from './components/sections/CompanyAnalysis.js';
import PriceIsPart from './components/sections/PriceIsPart.js';
import FindCompanies from './components/sections/FindCompanies.js';
import SelecaoAxiva from './components/sections/SelecaoAxiva.js';
import CompanyComparison from './components/sections/CompanyComparison.js';
import CustomCriteria from './components/sections/CustomCriteria.js';
import TrackChanges from './components/sections/TrackChanges.js';
import Methodology from './components/sections/Methodology.js';
import WhoIsItFor from './components/sections/WhoIsItFor.js';
import Pricing from './components/sections/Pricing.js';
import FAQ from './components/sections/FAQ.js';
import FinalCTA from './components/sections/FinalCTA.js';
import Footer from './components/sections/Footer.js';
function App() {
    return (React.createElement("div", { className: "min-h-screen bg-axiva-bg" },
        React.createElement(Header, null),
        React.createElement("main", null,
            React.createElement(Hero, null),
            React.createElement(MercadoHoje, null),
            React.createElement(PlatformOverview, null),
            React.createElement(CompanyAnalysis, null),
            React.createElement(PriceIsPart, null),
            React.createElement(FindCompanies, null),
            React.createElement(SelecaoAxiva, null),
            React.createElement(CompanyComparison, null),
            React.createElement(CustomCriteria, null),
            React.createElement(TrackChanges, null),
            React.createElement(Methodology, null),
            React.createElement(WhoIsItFor, null),
            React.createElement(Pricing, null),
            React.createElement(FinalCTA, null),
            React.createElement(FAQ, null)),
        React.createElement(Footer, null)));
}
export default App;
