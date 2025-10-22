# BrandNERD - An Extensive Brand Dataset and Analysis Pipeline for Named Entity Resolution

## Named entity resolution

Named entity resolution (NER) is the process of aggregating a number of similar strings that are semantically the same (i.e., they represent the same entity) and associating it with a single name. 

For instance, all the following names correspond to the same entity

- IBM"
- I.B.M.
- International Business Machines
- I B M

This is done in several steps:

1. Canonicalization, where a set of entity name variations are mapped to a single entity name. For instance, all the following variations are mapped to a single canonical entity name
   `["IBM", "I.B.M.", "International Business Machines", "I B M" ] → "IBM"`

2. Similarity calculation and clustering, which compares pairs of entities and outputs a similarity score. For instance, looking at the similarity score between the following brands, we can easily group similar brands, despite spelling errors and typos.

   ```bash
	DISNEY - DSINEY: 0.95
	DISNEY - DELTA: 0.41
	DISNEY - DLETA: 0.41
	DELTA - DLETA: 0.95
   ```

3. Validation, that is, using external databases to identify actual entity names from those that don't. For instance, in the following case, we can count the number of search results on Google.

   ```bash
	DISNEY: 32.000.000 
	DSINEY: 500
	DELTA: 5.000.000
	DLETA: 2.000
   ```

**For additional information** watch this video https://youtu.be/qkT42Bu8Njw.

---



## Content of the repository

The repository contains the following files/folders
- [brands.csv](./brands.csv): the original list of brands listed in order of item count (descending). The item count is not provided because:
  - it can change with every new auction
  - although it could be relevant for validation, we don't want to use it at this point (instead, we can use the order in which brands appear)

- [00_documentation](./00_documentation): useful documents and resources
- [01_canonicalization](./01_canonicalization): program that automatically canonicalizes and aggregates brands based on a set of rules
- [02_similarity-calculation](./02_similarity-calculation): program that automatically calculates similarity between brands
- [03_validation](./03_validation): program that automatically validates existing brands
- [04_review](./04_review): program that enables to manually review and aggregate processed and validated brands based on their similarity score

---


