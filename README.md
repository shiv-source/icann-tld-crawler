# ICANN TLD Crawler

A high-performance Node.js-based crawler that scrapes the official [ICANN](https://www.icann.org/) website to collect, normalize, and export structured **Top-Level Domain (TLD)** data in a clean, developer-friendly JSON format.

---

## 🌐 Overview

This crawler automates the extraction and formatting of public TLD records maintained by ICANN, providing structured insights into:

- 🧾 **TLD Metadata** — including name, category, and registration dates  
- 🏢 **Sponsoring Organizations** — with associated websites  
- 🔗 **Registry Services** — WHOIS, RDAP, and registration service URLs  
- 🧠 **Technical Infrastructure** — authoritative name servers and IP mappings  
- 🕒 **Timestamps** — registration and last update tracking

The output is suitable for developers, researchers, domain registrars, and security analysts.

---

## 📅 Data Freshness

> This dataset is automatically updated on a daily basis by the crawler.  
> Outputs are written to JSON files and previewed in tabular format below.

---

## 📊 TLD Summary Tables

### 🌍 Generic TLDs

| ID | TLD | WhoIs Server | RDAP Server | Sponsor Organization |
| -- | --- | ------------ | ----------- | -------------------- |

> 📦 Full dataset available in [`generic-tlds.json`](./data/generic-tlds.json)
> 💡 This table is automatically regenerated daily from live ICANN data.

---

### 🏳️ Country Code TLDs

| ID | TLD | WhoIs Server | RDAP Server | Sponsor Organization |
| -- | --- | ------------ | ----------- | -------------------- |


> 📦 Full dataset available in [`country-code-tlds.json`](./data/country-code-tlds.json)
> 💡 This table is also auto-updated every 24 hours.

---

## 🧪 Sample JSON Output

Below is a sample record from the crawler output:

```json
{
  "tld": ".org",
  "category": "generic",
  "sponsoringOrganization": "Public Interest Registry",
  "infoUrl": "https://www.pir.org/",
  "lastUpdated": "2025-07-24T00:00:00Z",
  "registeredOn": "1985-01-01T00:00:00Z",
  "nameServers": [
    {
      "host": "a0.org.afilias-nst.info",
      "ipList": ["199.19.56.1", "2001:500:e::1"]
    }
  ],
  "registry": {
    "registrationServiceUrl": "https://www.pir.org/",
    "whoisServer": "whois.publicinterestregistry.net",
    "rdapServer": "https://rdap.publicinterestregistry.net/rdap/"
  }
}
```

---

## 🚀 Getting Started

Clone the repo and run the crawler locally:

```bash
git clone https://github.com/your-username/icann-tld-crawler.git
cd icann-tld-crawler
npm install
npm start
```

The crawler will fetch and store the latest TLD data in `tlds.json`, `generic-tlds.json`, and `country-code-tlds.json`.

---

## 📦 Output Files

| File                     | Description                        |
| ------------------------ | ---------------------------------- |
| `tlds.json`              | Full combined dataset              |
| `generic-tlds.json`      | Filtered list of generic TLDs      |
| `country-code-tlds.json` | Filtered list of country code TLDs |
| `README.md`              | Auto-updated with summary tables   |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 👤 Author

Created and maintained by [Shiv Kumar](https://github.com/shiv-source)

---

## 🤝 Contributing

Pull requests and improvements are welcome!
For major changes, please open an issue first to discuss what you'd like to modify.

---

## ⭐️ Support

If you find this project useful, consider giving it a ⭐️ on [GitHub](https://github.com/shiv-source/icann-tld-crawler)!

