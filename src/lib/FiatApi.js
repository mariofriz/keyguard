// Adapted and reduced version of FiatApi.ts from @nimiq/vue-components
class FiatApi {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @param {Array<FiatApi.SupportedCryptoCurrency>} cryptoCurrencies
     * @param {Array<FiatApi.SupportedFiatCurrency>} vsCurrencies
     * @returns {Promise<Partial<Record<
     *     FiatApi.SupportedCryptoCurrency,
     *     Partial<Record<FiatApi.SupportedFiatCurrency, number>>,
     * >>>}
     */
    static async getExchangeRates(cryptoCurrencies, vsCurrencies) {
        const coinIds = cryptoCurrencies.map(currency => FiatApi.COINGECKO_COIN_IDS[currency]);
        const response = await fetch(
            `${FiatApi.API_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=${vsCurrencies.join(',')}`,
        );
        if (!response.ok) throw new Error(`Failed to fetch exchange rates: ${response.status}`);
        const apiResult = await response.json();
        // Map coingecko coin ids back to SupportedCryptoCurrency enum and sanitize retrieved data.
        return cryptoCurrencies.reduce((result, cryptoCurrency) => {
            const record = apiResult[FiatApi.COINGECKO_COIN_IDS[cryptoCurrency]];
            const sanitizedRecord = Object.keys(record).reduce((sanitized, fiatCurrency) => ({
                ...sanitized,
                ...(Object.values(FiatApi.SupportedFiatCurrency).includes(/** @type {any} */ (fiatCurrency))
                    ? { [fiatCurrency]: parseFloat(record[fiatCurrency]) }
                    : null
                ),
            }), {});
            return {
                ...result,
                [cryptoCurrency]: sanitizedRecord,
            };
        }, {});
    }
}

/**
 * @readonly
 * @enum { 'nim' }
 * Crypto currencies supported by the coingecko api that are currently of interest for us.
 */
FiatApi.SupportedCryptoCurrency = {
    NIM: /** @type {'nim'} */ ('nim'),
};

/**
 * @readonly
 * @enum { 'aud' | 'brl' | 'cad' | 'cny' | 'eur' | 'gbp' | 'hkd' | 'ils' | 'inr' | 'jpy' | 'krw' | 'mxn' | 'nzd' |
 *     'twd' | 'usd' | 'vnd' }
 * Fiat currencies supported by the coingecko api. Note that coingecko supports more vs_currencies (see
 * https://api.coingecko.com/api/v3/simple/supported_vs_currencies) but also includes crypto currencies and ounces of
 * gold amongst others that are not fiat currencies. This list here has been generated by reducing the vs_currencies to
 * those that have a currency symbol.
 */
FiatApi.SupportedFiatCurrency = {
    AUD: /** @type {'aud'} */ ('aud'),
    BRL: /** @type {'brl'} */ ('brl'),
    CAD: /** @type {'cad'} */ ('cad'),
    CNY: /** @type {'cny'} */ ('cny'),
    EUR: /** @type {'eur'} */ ('eur'),
    GBP: /** @type {'gbp'} */ ('gbp'),
    HKD: /** @type {'hkd'} */ ('hkd'),
    ILS: /** @type {'ils'} */ ('ils'),
    INR: /** @type {'inr'} */ ('inr'),
    JPY: /** @type {'jpy'} */ ('jpy'),
    KRW: /** @type {'krw'} */ ('krw'),
    MXN: /** @type {'mxn'} */ ('mxn'),
    NZD: /** @type {'nzd'} */ ('nzd'),
    TWD: /** @type {'twd'} */ ('twd'),
    USD: /** @type {'usd'} */ ('usd'),
    VND: /** @type {'vnd'} */ ('vnd'),
};

/**
 * @readonly
 * Coingecko api url. Note that the origin must be whitelisted in the csp.
 */
FiatApi.API_URL = 'https://api.coingecko.com/api/v3';

/**
 * @readonly
 * Crypto currency tickers mapped to coingecko coin ids.
 */
FiatApi.COINGECKO_COIN_IDS = {
    [FiatApi.SupportedCryptoCurrency.NIM]: 'nimiq-2',
};
