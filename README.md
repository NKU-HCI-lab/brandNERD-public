# BrandNERD

**BrandNERD** is an extensive [brand dataset](#brand-dataset) and [analysis pipeline](#analysis-pipeline) for [Named Entity Resolution](#named-entity-resolution)



# Named entity resolution

## Named Entity Resolution

Named Entity Resolution (NER) in **BrandNERD** is the process of identifying different textual representations of the same brand and consolidating them into a single canonical entity. In practice, brand names appear in many surface forms due to punctuation differences, spelling variations, formatting changes, or additional descriptive text. The goal of the pipeline is therefore to detect these variations, determine whether they correspond to real brands, and map them to a unified canonical identifier that represents the underlying entity. 

The BrandNERD NER pipeline combines automated processing, web evidence collection, similarity analysis, and human validation. It operates on a sequence of datasets that progressively refine the brand list—from noisy raw inputs to a structured lookup table of resolved brand entities. Each stage of the pipeline produces intermediate artifacts that serve as inputs to the next step.

### Overview of the Pipeline

The pipeline begins with a large set of raw brand names collected from external sources. These surface forms may contain duplicates, formatting inconsistencies, or incorrect entries. The first stage transforms these strings into **canonical brand identifiers**, which normalize the representation of each brand so that equivalent strings can be compared reliably.

For example, several surface forms referring to the same brand may appear in the raw dataset:

```
CAT & JACK
CAT JACK
CAT&JACK
CAT & JACK™
VISIT THE CAT & JACK STORE
```

After canonicalization, these variants are normalized into a single canonical identifier:

```
CATJACK
```

Once canonical identifiers are generated, the pipeline collects **contextual evidence from the web** for each brand. Search results are retrieved and parsed to gather titles, URLs, and snippets that provide information about how the brand appears in real-world web pages. This contextual data enables the system to confirm whether a canonical identifier corresponds to an actual brand and to identify additional surface variants that appear in online catalogs or retail pages.

For instance, a search query for a canonical brand might return results such as:

```
Title: Amazon.com: CAT & JACK Kids Clothing
URL: https://www.target.com/b/cat-jack/-/N-55c3v
Snippet: Shop Cat & Jack clothing, shoes and accessories for kids at Target.
```

From these results, the pipeline may extract additional brand surface forms:

```
CAT & JACK
CAT JACK
CAT & JACK KIDS
```

These are again normalized to the canonical representation:

```
CATJACK
```

From these search results, the system extracts **verified brand names** and their canonical equivalents. Because automated verification cannot always determine validity with complete certainty, the pipeline incorporates a **manual validation step**. Through a review interface, users label canonical brands as valid or invalid and optionally correct or replace incorrect canonical forms. This produces a curated set of validated brand identifiers that serve as reliable reference entities.

For example, a reviewer may classify the following canonical identifiers:

```
Validated
---------
CATJACK
AMAZONBASICS
ZINUS

Invalidated
-----------
0LITSTR
075INCH
```

After validation, the pipeline analyzes **string similarity relationships** between canonical brands. Similarity metrics are used to detect canonical identifiers that may represent the same brand despite minor differences in spelling, tokenization, or formatting. These similarities are used to build clusters that associate unvalidated or ambiguous brand identifiers with the most similar validated brand.

For example:

```
PURINADOGCHOW    PURINA       0.93
DIAMONDNATURALS  DIAMONDPETFOODS  0.91
CHAMPIONSPARKPLUG CHAMPION    0.90
```

The resulting clusters are then reviewed in a **resolution stage**, where ambiguous or variant canonical identifiers are mapped to a selected validated canonical brand. This step produces the final mapping between variant identifiers and their resolved brand entity.

Example resolution mappings:

```
Invalid                      Valid
----------------------------------------
PURINADOGCHOW                PURINA
DIAMONDNATURALS              DIAMONDPETFOODS
CHAMPIONSPARKPLUG            CHAMPION
```

### Inputs and Outputs

The pipeline operates on several progressively refined datasets:

* **Inputs**

  * Raw surface brand names extracted from external sources.
  * Canonical brand identifiers derived from those surface forms.
  * Web search results providing contextual evidence about brands.
  * Verified brand names extracted from structured web pages.
  * Manually validated lists of valid and invalid canonical brands.
  * Similarity scores between canonical identifiers.

Example input (raw surface brands):

```
CAT & JACK
CAT JACK
CAT&JACK
AMAZON BASICS
AMAZONBASICS
PURINA DOG CHOW
```

Example canonicalized input:

```
CATJACK
AMAZONBASICS
PURINADOGCHOW
```

* **Outputs**

  * Canonicalized brand datasets and variant mappings.
  * Lists of verified and validated brand identifiers.
  * Clusters of similar brand identifiers.
  * A final **brand resolution lookup table** mapping invalid or variant identifiers to their corresponding validated canonical brand.

Example final lookup table:

```
Invalid             Valid
-------------------------------
PURINADOGCHOW       PURINA
DIAMONDNATURALS     DIAMONDPETFOODS
STANLEYFAAX         STANLEY
AWP                 ADVANCEDWORKPRODUCTS
```

### Resulting Brand Resolution

The final output of the NER pipeline is a consolidated lookup table that links variant or invalid canonical brand identifiers to a single validated canonical name. This table enables downstream systems to consistently reference brands using a unified identifier, regardless of the surface form originally observed.

Example resolution workflow for a group of brands:

```
Surface forms
-------------
PURINA DOG CHOW
PURINA DOGCHOW
PURINADOGCHOW

Canonical forms
---------------
PURINADOGCHOW

Similarity match
----------------
PURINADOGCHOW → PURINA

Final resolution
----------------
PURINADOGCHOW → PURINA
```

---



# Brand dataset

Our **brand dataset** includes several datasets. The datasets are continuously updated.

### 00_original

The file `brands.csv` contains a list of brands initially retrieved from the website in their surface forms. Many of these brand names contain errors including misspelled brands, non-existing brand names, and similar names referring to the same brand. 

Example:

```
CAT & JACK
ZINUS
AMAZON BASICS
THRESHOLD
HOMEDICS
WONDERSHOP
WILD FABLE
AMAZONBASICS
ROOM ESSENTIALS
```



### 01_canonical

The file `brands_canonical.csv` contains a list of canonical brand names obtained by applying the canonicalization steps and rules (see INSERT_LINK). 

Example:

```
CATJACK
ZINUS
AMAZONBASICS
THRESHOLD
HOMEDICS
WONDERSHOP
WILDFABLE
ROOMESSENTIALS
```

The file `brands_canonical.json` contains an object with the correspondence of each canonical brand name with their original surface names. 

Example:

```
{
  "CATJACK": [
    "CAT & JACK",
    "CAT & JACK&#153;",
    "CAT JACK",
    "CAT&JACK"
  ],
  "ZINUS": [
    "ZINUS",
    "?ZINUS",
    "VISIT THE ZINUS STORE",
    "ZINUS INC.",
    "ZINUS, INC",
    "ZINUS."
  ],
  "AMAZONBASICS": [
    "AMAZON BASICS",
    "AMAZONBASICS",
    "?AMAZON BASICS",
    "VISIT THE AMAZONBASICS STORE",
    "BY AMAZONBASICS",
    "AMAZON BASICS,",
    ", AMAZON BASICS"
  ],
  ...
}
```



### 02_web-search-results

This folder contains the results of web searches for the brand name (see INSERT_LINK). Each subfolder contains JSON files each containing the entries obtained by querying the search engine with the key corresponding to the folder name and the brand. Each folder contains a number of JSON files (one per brand) with an array of search engine results, each including: the search key used for the brand (`k`), the url of the entry (`u`), the title (`t`), and the preview snippet (`s`).

Example:

```
[
  {
    "k": "0LITSTR",
    "t": "Amazon.com: O'LITSTR Tree Topper Star 3D Infinity 9.9 Inch Indoor Tree Top Decoration Warm White LED : Home & Kitchen",
    "u": "https://www.amazon.com/0LITSTR-Topper-Infinity-Indoor-Decoration/dp/B07TK13J8S",
    "s": "Buy O'LITSTR Tree Topper Star 3D Infinity 9.9 Inch Indoor Tree Top Decoration Warm White LED: Seasonal Décor - Amazon.com ✓ FREE DELIVERY possible on eligible purchases"
  },
  {
    "k": "0LITSTR",
    "t": "Where to buy Litentry (LIT)?",
    "u": "https://changelly.com/buy/lit",
    "s": ""
  },
  {
    "k": "0LITSTR",
    "t": "LIT to USD: Convert Litentry (LIT) to US Dollar (USD) | Coinbase: lit to usd, lit to dollar",
    "u": "https://www.coinbase.com/converter/lit/usd",
    "s": "The exchange rate of Litentry is decreasing. The current value of 1 LIT is $0.0897 USD. In other words, to buy 5 Litentry, it would cost you $0.4483 USD."
  }
]
```



### 03_verified

This folder contains the brand entities confirmed by the verification step (see `03_verification`). The verification process analyzes web search results for each canonical brand and extracts brand identifiers from known e-commerce and catalog websites. It detects brand pages using domain-specific URL patterns and applies the canonicalization rules to normalize the extracted brand names.

The verification step produces three outputs:

* a list of **surface brand names** observed in the search results
* a list of **canonical brand identifiers** confirmed through parsing of brand pages
* a **confidence report** describing how strongly each canonical brand is supported by the search results

Because the verification is based on web search results, the extracted brands are not necessarily identical to the original brand list used in the search step. Instead, they represent brands that were actually observed in brand pages returned by search engines. As a result, the verified set may partially overlap with the original list but can also contain additional variants discovered during the process.


The file `verified_surface.csv` contains the list of **surface brand names** extracted from the analyzed websites. These correspond to the brand names as they appear in page titles or URLs.

Example:

```
BEE SPOKE
BEHRENS
BELLABUG
BENE BONE
BERNE
BERNZOMATIC
BEST FRIENDS BY SHERI
BESTNEST
BESTSTEP
BETTERBUILT
BIG HORN
BIGJ
BIL JAC
BLACK & DECKER
```


The file `verified_canonicals.csv` contains the **canonical brand identifiers** obtained by applying the canonicalization rules (see canonicalization step) to the extracted surface names.

Example:

```
BEESPOKE
BEHRENS
BELLABUG
BENEBONE
BERNE
BERNZOMATIC
BESTFRIENDSBYSHERI
BESTNEST
BESTSTEP
BETTERBUILT
BIGHORN
BIGJ
BILJAC
BLACKDECKER
```

The file `validated_confidence.json` contains **verification statistics for each canonical brand**, allowing downstream processes to estimate how confidently a canonical corresponds to a real brand.

For each canonical brand, the file records:

* **t** – total number of search results analyzed for the canonical query
* **c** – number of results where a brand page matching the canonical was detected
* **p** – percentage of matches (`c / t * 100`), which can be used as a confidence score
* **alt** – alternative canonicals detected in the search results when the extracted brand differs from the queried canonical

Example entry:

```json
{
  "AROAMHOUSEWARES": {
    "t": 22,
    "c": 0,
    "p": 0,
    "alt": {
      "AROMAHOUSEWARES": 1
    }
  },
  "AROMAHOUSEWARES": {
    "t": 7,
    "c": 7,
    "p": 100
  }
}
```

In this example:

* The canonical **AROAMHOUSEWARES** appears to be a misspelling: none of the 22 analyzed results matched it directly, but one result corresponds to **AROMAHOUSEWARES**.
* The canonical **AROMAHOUSEWARES** has 7 results and all of them correspond to brand pages, resulting in a **100% confidence score**.

This file enables filtering or ranking of candidate brands based on how strongly they are supported by actual brand pages found in search results. 



### 04_validated

This folder contains surface brand names extracted from known websites using the brand extraction script (see INSERT_LINK). This list, which results from web searches made with the original brand names, contains brand names that appeared in the web search results. Therefore, this is a completely different set that, however, might intersect with the original list of brands.

The file `validated.csv` contains a list of canonical brand names that have been manually flagged as valid.

Example:

```
BADBOY
BARNESPAPERCOMPANY
BOSS
BRADLEYSMOKER
HIGHTECHPET
BRAZOS
COLEMANPOWERSPORTS
COLUMBIASPORTSWEAR
DASUQUIN
```

The file `invalidated.csv` contains a list of canonical brand names that have been manually flagged as invalid.

Example:

```
07060A
075INCH
0ANIV
0LITSTR
105X15
APEXGEARCMRESHOPBYBRANDBRANDLINKAPEXGEAR
```



### 05_similarity_clusters

The file `similar_oneway.csv` contains the one-way similarity between the original canonicals and the validated brands, calculated using Jaro Winkler and by setting a desired similarity threshold (see INSERT_LINK). 

Examples:

```
CATJACK	100BALANCE	0.58
CATJACK	ANTLERKING	0.58
CATJACK	APEXGEAR	0.51
CATJACK	ARIAT	0.57
CATJACK	ARMORALL	0.51
CATJACK	3C4GTHREECHEERSFORGIRLS	0.52
```



### 06_aggregated

The file `aggregated_[THRESHOLD].json` contains invalid canonicals aggregated with valid canonicals based on a predefined similarity threshold.  

Examples:

```
-> VALID
-> INVALID
-> DUPLICATE
```



### 07_resolved

The file `lookup.tsv` contains a lookup table where invalid brands are aggregated with their valid resolved names.  

Examples:

```
Invalid						Valid
0LITSTR						OLISTR
CHAMPIONSPARKPLUG			CHAMPION
DIAMONDNATURALSGRAINFREE	DIAMONDPETFOODS
PURINADOGCHOW				PURINA
DIAMONDNATURALS				DIAMONDPETFOODS
STANLEYFAAX					STANLEY
AWP							ADVANCEDWORKPRODUCTS

```





# Analysis pipeline

Our **analysis pipeline** includes several steps for resolving brands. The pipeline and its scripts are continuously updated.

### 01_canonicalization

The purpose of `canonicalize.js` is to normalize many surface forms of brand names into a consistent canonical representation so that equivalent entities can be matched reliably.

The rule module first simplifies raw brand strings by decoding URL-encoded text, removing trademarks and corporate suffixes (e.g., *INC*, *LLC*), stripping punctuation and non-ASCII characters, and cleaning common patterns such as “VISIT THE X STORE” or “BY X”. It also filters out invalid or low-quality entries such as purely numeric brands or certain label codes. 

After simplification, the canonicalization step removes all remaining non-alphanumeric characters (including spaces) to produce a compact canonical key (e.g., `"CAT & JACK, INC." → "CATJACK"`).

Input:

- the dataset of surface brand names (`00_original/brands.csv`)

Output:

- the deduplicated list of canonical brands (`01_canonical/brands_canonical.csv`)
- a mapping from canonical brand identifiers to the list of observed surface variants (`01_canonical/brands_canonical.json`)

### 02_web_search

The purpose of `web-search.js` is to collect web search results for each canonical brand in order to gather contextual information about the brand from the web.

The script loads the list of canonical brand identifiers and automatically queries a search engine (Brave Search) using Selenium browser automation. For each canonical brand, it performs a search query (e.g., `buy BRAND products`) and retrieves the HTML of the results page. The page content is then parsed using Cheerio to extract structured information from each search result, including the title, URL, and snippet text.

To support large-scale processing, the script skips brands that have already been validated or previously failed, periodically saves results, and stores the extracted search results for each canonical brand as a JSON file. It also includes mechanisms for handling captchas and preventing browser crashes during automated browsing.

Input:

- the list of canonical brands (`01_canonical/brands_canonical.json`)
- the list of previously validated brands (`03_validated/validated.tsv`, optional)

Output:

- the collected search results for each canonical brand (`02_web-search-results/<query>/_<canonical_brand>.json`)
- the list of brands whose searches failed (`02_web-search-results/failed.tsv`)


### 03_verification

The purpose of `verify.js` is to extract and confirm valid brand entities from the collected web search results and compute a confidence score for each canonical brand.

The script processes the search result files generated in the previous step and analyzes the URLs and titles of each result to detect brand identifiers. It extracts the domain from each URL and applies a set of domain-specific rules to identify brand names embedded in structured URLs (e.g., `/brand/<name>` paths used by many retail sites). For each recognized pattern, the extracted brand name is canonicalized using the same canonicalization rules from the previous step and compared against the expected canonical brand.

When a brand match is confirmed, the script records the canonical brand identifier and, when available, the corresponding surface brand name observed in the search results. Domains that cannot be reliably parsed are skipped or optionally flagged for later analysis. This step therefore validates which canonical brands appear in real e-commerce or catalog pages and collects additional surface forms of the brand.

In addition to validating brand occurrences, the script computes **verification statistics** for each canonical brand based on the analyzed search results:

* **t (total results)** – the number of search results retrieved for the canonical query.
* **c (confirmed matches)** – the number of pages where the brand canonical is detected through the domain-specific parsing rules.
* **p (match percentage)** – the ratio `c/t`, expressed as a percentage. This value can be used as a **confidence score** indicating how strongly the search results confirm the brand.
* **alt (alternative canonicals)** – alternative canonical brands detected in the results when they differ from the queried canonical. These typically represent corrections or closely related brand spellings found in the search results.

For example:

* Querying **AROAMHOUSEWARES** may return 22 search results (`t=22`) but no pages matching the canonical (`c=0`). Instead, several results may correspond to the brand **AROMAHOUSEWARES**, which will appear in the `alt` field.
* Querying **AROMAHOUSEWARES** may return 7 results (`t=7`), all of which correspond to brand pages (`c=7`, `p=100%`), indicating high confidence that this canonical represents a real brand.

These statistics allow downstream processes to filter or prioritize canonical brands based on how strongly they are supported by real brand pages in search results.

Input:

* the web search results for canonical brands (`02_web-search-results/<query>/_<canonical_brand>.json`)
* the canonicalization rules (`01_canonicalization/_lib.canonicalization-rules.js`)
* the optional list of domains to ignore (`02_web-search/nodomains.tsv`)

Output:

* the list of verified canonical brands (`03_verified/verified_canonicals.csv`)
* the list of verified surface brand names (`03_verified/verified_surface.csv`)
* the verification confidence metrics for each canonical (`03_verified/validated_confidence.json`)

The verification logic and domain-specific extraction rules are implemented in the script itself. 

### 04_validation

The purpose of `server.js` is to provide a web-based interface for manually validating the list of candidate canonical brands identified in the previous step.

The script runs a small Express web server that loads the list of verified canonical brands and presents them one at a time to the user for review. For each brand, the interface allows the user to mark it as **valid** or **invalid**, optionally open a search query (e.g., “buy BRAND products”) to inspect external evidence, or replace it with a corrected canonical brand. User decisions are recorded incrementally to avoid reprocessing already-reviewed brands.

When a brand is marked as valid or invalid, the decision is appended to the corresponding output file. If a brand is replaced by another canonical form, the system records the mapping between the invalid brand and the corrected one in a lookup table. The interface also tracks progress and skips brands that have already been labeled.

Input:

- the list of verified canonical brands (`03_verified/verified_canonicals.csv`)

Output:

- the list of validated canonical brands (`04_validated/validated.csv`)
- the list of invalidated canonical brands (`04_validated/invalidated.csv`)
- the mapping between invalid and corrected canonical brands (`07_resolved/lookup.tsv`)

### 05_similarity_clustering

The purpose of `calculate-similarity.js` is to identify canonical brand names that are highly similar to each other, which may indicate duplicates or closely related variants that should be clustered or merged.

The script loads the full list of canonical brands and the subset that has been manually validated. It then computes the pairwise similarity between each canonical brand and the validated brands using the **Jaro–Winkler string similarity metric**, which gives higher scores to strings that share similar characters and common prefixes.

For each comparison, if the similarity score exceeds a predefined threshold (e.g., 0.9), the pair is recorded as a potentially related pair. This process helps identify cases where different canonical strings may actually refer to the same brand due to minor spelling variations, tokenization differences, or formatting inconsistencies. The resulting pairs can then be reviewed to form clusters of related brand identifiers.

Input:

- the list of canonical brands (`01_canonical/brands_canonical.csv`)
- the list of validated canonical brands (`04_validated/validated.csv`)

Output:

- the list of highly similar brand pairs (`05_similarity_clusters/similar_oneway.csv`)

### 06_aggregation

The purpose of `aggregate.js` is to assign unvalidated canonical brand names to the most similar validated brand, creating clusters of related brand identifiers.

The script loads the full set of canonical brands, the subset of brands that have been manually validated, and the list of similar brand pairs produced in the previous step. It then analyzes the similarity pairs and, for each unvalidated brand, identifies the validated brand with the highest similarity score above a specified threshold. Only the strongest match for each unvalidated brand is retained to avoid ambiguous assignments.

Using these matches, the script constructs groups where each validated brand acts as the cluster representative and the associated unvalidated brands are assigned as its variants. This produces a structured mapping of validated brands to similar canonical forms that likely represent the same entity.

Input:

- the list of canonical brands (`01_canonical/brands_canonical.csv`)
- the list of validated canonical brands (`04_validated/validated.csv`)
- the list of similar brand pairs (`05_similarity_clusters/similar_oneway.csv`)

Output:

- the aggregated clusters of related brands (`06_aggregated/aggregated_<threshold>.json`)

### 07_resolution

The purpose of `server.js` is to provide a web-based interface for reviewing and resolving clusters of similar brand identifiers produced in the aggregation step.

The script runs an Express web server that loads the aggregated similarity clusters, the list of validated canonical brands, and the existing lookup table of resolved mappings. It displays groups where a validated canonical brand is associated with several similar unvalidated brands. For each group, the interface allows the user to select which brands should map to the canonical brand (or optionally choose a different validated canonical) and approve the mapping.

When a group is approved, the selected brand mappings are appended to the lookup table, linking each unvalidated brand to its resolved canonical form. The application also stores internal state to ensure that resolved groups are not shown again in future sessions.

Input:

- the aggregated similarity clusters (`06_aggregated/aggregated_<threshold>.json`)
- the list of validated canonical brands (`04_validated/validated.csv`)
- the existing lookup mappings (`07_resolved/lookup.tsv`)

Output:

- the updated brand resolution lookup table (`07_resolved/lookup.tsv`)
- the internal state of resolved groups (`data/state.json`)