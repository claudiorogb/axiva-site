export const companies = {
    PETR4: {
        ticker: 'PETR4',
        name: 'Petrobras PN',
        sector: 'Petróleo, Gás e Biocombustíveis',
        subsector: 'Exploração, Refino e Distribuição',
        price: 47.99,
        graham: 93.22,
        quality: 5,
        pl: 4.64,
        pvp: 1.29,
        dy: 7.6,
        roe: 27.7,
        roic: 19.7,
        margin: 24.4,
        growth5y: -2.3,
        lpa: 10.35,
        vpa: 37.32,
        dayChange: -2.58,
        performance6m: 0.1,
        history6m: [49.08, 42.00, 37.80, 43.42, 45.02, 49.12],
        notes: ['P/L positivo', 'ROE acima de 10%', 'ROIC acima de 10%', 'DY positivo', 'Liquidez elevada'],
    },
    ITUB4: {
        ticker: 'ITUB4',
        name: 'Itaú Unibanco PN',
        sector: 'Intermediários Financeiros',
        subsector: 'Bancos',
        price: 42.13,
        graham: 42.33,
        quality: 4,
        pl: 9.97,
        pvp: 2.24,
        dy: 7.4,
        roe: 22.4,
        roic: null,
        margin: null,
        growth5y: 30.3,
        lpa: 4.23,
        vpa: 18.83,
        dayChange: 0.62,
        performance6m: 0.0,
        history6m: [43.19, 40.04, 42.18, 42.89, 39.52, 43.18],
        notes: ['P/L positivo', 'ROE acima de 10%', 'DY positivo', 'Liquidez elevada'],
    },
    VALE3: {
        ticker: 'VALE3',
        name: 'Vale ON',
        sector: 'Mineração',
        subsector: 'Minerais Metálicos',
        price: 70.77,
        graham: 48.29,
        quality: 4,
        pl: 30.30,
        pvp: 1.60,
        dy: 7.9,
        roe: 5.3,
        roic: 18.1,
        margin: 4.0,
        growth5y: -2.4,
        lpa: 2.34,
        vpa: 44.30,
        dayChange: 0.16,
        notes: ['P/L positivo', 'ROIC acima de 10%', 'DY positivo', 'Liquidez elevada'],
    },
    WEGE3: {
        ticker: 'WEGE3',
        name: 'WEG SA',
        sector: 'Máquinas e Equipamentos',
        subsector: 'Motores, Compressores e Outros',
        price: 51.07,
        graham: 12.27,
        quality: 5,
        pl: 34.27,
        pvp: 11.36,
        dy: 4.1,
        roe: 33.2,
        roic: 24.3,
        margin: 16.6,
        growth5y: 11.2,
        lpa: 1.49,
        vpa: 4.49,
        dayChange: 0.65,
        notes: ['P/L positivo', 'ROE acima de 10%', 'ROIC acima de 10%', 'DY positivo', 'Liquidez elevada'],
    },
    ABEV3: {
        ticker: 'ABEV3',
        name: 'Ambev ON',
        sector: 'Bebidas',
        subsector: 'Cervejas e Refrigerantes',
        price: 15.32,
        graham: 11.60,
        quality: 5,
        pl: 14.60,
        pvp: 2.69,
        dy: 5.6,
        roe: 18.4,
        roic: 20.6,
        margin: 19.0,
        growth5y: 3.9,
        lpa: 1.05,
        vpa: 5.70,
        dayChange: -0.13,
        notes: ['P/L positivo', 'ROE acima de 10%', 'ROIC acima de 10%', 'DY positivo', 'Liquidez elevada'],
    },
};
export const comparisonTickers = ['PETR4', 'ITUB4', 'VALE3'];
export const selectionTickers = ['ITUB4', 'WEGE3', 'PETR4', 'VALE3'];
export const researchTickers = ['PETR4', 'ITUB4', 'VALE3', 'WEGE3', 'ABEV3'];
export const customListTickers = ['PETR4', 'ITUB4', 'WEGE3', 'VALE3'];
export function getCompany(ticker) {
    return companies[ticker];
}
export function formatCurrency(value) {
    return value == null ? 'N/D' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function formatNumber(value, digits = 1) {
    return value == null ? 'N/D' : value.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}
export function formatPercent(value, digits = 1) {
    return value == null ? 'N/D' : `${value.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })}%`;
}
export function formatSignedPercent(value, digits = 1) {
    if (value == null) return 'N/D';
    const signal = value > 0 ? '+' : '';
    return `${signal}${formatPercent(value, digits)}`;
}
