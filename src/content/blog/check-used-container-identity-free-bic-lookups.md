---
title: "Check a Used Container's Identity for Free: 4 Lookups and What They Cannot Tell You"
description: "Four free BIC lookups let you verify a used container's number, prefix owner, theft alerts and ACEP record before you pay. Here is what each one proves, and what none of them can."
pubDate: 2026-08-27
category: "Buyer's Guides & How-To"
pillar: "Container Knowledge & Terminology"
format: "How-To"
keywords:
  - "check container number online free"
  - "bic code register lookup"
  - "boxtech container search"
  - "stolen shipping container check"
  - "acep database lookup"
  - "csc plate meaning"
author: "Steel Box Direct"
draft: false
takeaways:
  - "These free lookups tell you about a container's identity and provenance, never its condition or current examination status"
  - "The BIC Code Register shows who holds a prefix today, which may not be who owned your box: PONU now resolves to Maersk A/S, and defunct lines like HJCU return no result at all"
  - "BoxTech shows Sold, Scrapped, Lost and Stolen alerts, which makes it the one check worth doing before money changes hands, but it needs a free account"
  - "The Global ACEP Database is the only step with no signup, and a hit proves the operator's programme exists, not that your container was in it"
  - "The CSC plate never expires, and 49 CFR 451.23 requires it to stay legible for the life of the container"
  - "For US storage and domestic trucking none of this is required: 49 CFR 450.1 scopes the whole regime to international transport"
faq:
  - q: "Can you check a shipping container's CSC certification status online for free?"
    a: "No. No free public database returns a specific container's current CSC examination status. BIC's BoxTech database holds inspection-date, next-inspection-date and certificate-expired fields, but all three are permission-gated behind a CertificateViewer role that ordinary free accounts do not have. The BIC Global ACEP Database is free and public but indexes examination programmes and the operators that hold them, not individual containers. Current examination status can only be established by a physical examination performed by qualified personnel, which 49 CFR 452.3 requires to be trained and experienced in detecting container structural damage."
  - q: "How do you check whether a used shipping container is stolen?"
    a: "BIC's BoxTech database displays four container alert types on search results: Sold, Scrapped, Lost and Stolen. BIC's documentation defines the Stolen alert as meaning \"the theft of the container has been reported to authorities and a police report filed,\" and instructs that \"anyone finding this container should contact the BIC Code Holder.\" Searching requires a free BoxTech account and a complete, valid container number. Participation in BoxTech is voluntary, per UK Maritime and Coastguard Agency notice MIN 633, so a blank result does not prove a container is clean. No US national stolen-container registry exists."
  - q: "Does a CSC safety approval plate expire?"
    a: "No. A CSC Safety Approval Plate carries no expiry date field. US regulations at 49 CFR 451.23 require the plate to be designed to \"remain legible for the working life of the container\" and to have \"a legible life expectancy equal to or greater than the life expectancy of the container to which the plate is affixed.\" What does lapse is the container's examination status, which is recorded separately on a Next Examination Date decal or through an approved continuous examination programme marking, not on the plate itself."
  - q: "What does an ACEP number on a container plate actually prove?"
    a: "An ACEP number identifies an approved continuous examination programme held by a container operator and issued by a national administration. Looking it up in BIC's Global ACEP Database confirms that programme exists and who audits it. It does not confirm that any particular container is or ever was enrolled in it. BIC states directly that prefix information in the database is \"just informational and should not be taken into consideration as far as the validity of the ACEP programs are concerned.\" Once a container is sold out of an operator's fleet, its coverage under that fleet's programme ends."
---

You are standing next to a used container with your phone out. There is a number stencilled on the side and a metal plate riveted inside the door. You want to know what you actually bought.

There are four free tools that will tell you something real, and a much longer list of things none of them can tell you. This post walks all four, using searches run live on August 27, 2026, and is honest at every step about what a blank result means. Tool interfaces and search results change, so treat the specific results below as a snapshot of that date.

One thing to settle before step 1.

## What these tools can and cannot tell you

Free public lookups answer questions about **identity** and **provenance**. Is this a real, correctly formed container number? Which company holds that owner prefix? Has the box been reported sold, scrapped, lost or stolen? Does the programme number on the plate trace to a real operator under a real government?

They answer nothing about **condition** and nothing about **current examination status**. There is no free public database that will tell you whether the container in front of you passed an inspection, when it was last examined, or whether it would pass one today. Anyone promising you a free online CSC status check is selling something that does not exist.

And here is the part that matters most for readers in Ohio, Indiana, Kentucky and West Virginia: for US storage and domestic trucking, none of this paperwork is required in the first place. The Coast Guard regulations that govern container safety approval and examination state their own scope at 49 CFR 450.1, which establishes requirements "for safety approval and periodic examination of cargo containers used in international transport." A box sitting on your gravel pad holding a skid steer is outside that regime entirely. Our [container certification guide](/container-certification-guide/) and our post on [getting a used container certified](/blog/get-a-used-shipping-container-certified/) both make the same point, and both send storage buyers home early on purpose.

So run these checks for peace of mind and for theft protection. Do not run them because you think you owe someone compliance.

## Step 1: Is the number even real? (no account needed)

Every ISO 6346 container number ends in a check digit that is calculated from the ten characters before it. If the check digit does not match, the number was mis-stencilled, mis-transcribed, or made up.

We already teach that arithmetic character by character in [how to read a container ID number](/blog/how-to-read-container-id-number-iso-6346/). No need to repeat it here. What that post does not mention is that BIC publishes its own free calculator, so you do not have to do the math on a tailgate:

**[BIC Check Digit Calculator](https://www.bic-code.org/check-digit-calculator/)** (free, no login)

You enter a four-character owner code, a starting serial number and an ending serial number, and it returns a table of BIC code, serial number and check digit. It will do up to 100 sequential numbers at once, which is useful if you are buying a row of boxes rather than one.

One URL warning. Do not go looking for the calculator under the `/bic-codes/` register path. It is not there, and that path renders "No code found" instead. The calculator lives at `/check-digit-calculator/` only.

If the check digit is wrong, stop and re-read the number off the box before you conclude anything. Stencils get worn, and 8 and B look alike at dusk.

## Step 2: Who holds the prefix? (no account needed)

The first four characters are the owner code: three letters plus a category letter. BIC maintains the official register of these codes.

**[BIC Code Register](https://www.bic-code.org/bic-codes/)** (free, no login)

Search by code, by company or by country. A hit returns the registered company name, street address, city, state, ZIP, country, phone, fax and website. The register holds roughly three to four thousand registered codes across more than a hundred countries.

Searching `MSCU` on August 27, 2026 returned MSC Mediterranean Shipping Company S.A., Chemin Rieu 12-14, Geneva, Switzerland. Searching `TGHU` returned Textainer Equipment Management Limited, Hamilton, Bermuda. Searching `CAIU` returned CAI International, Inc., San Francisco.

Now the three things nobody tells you about this lookup.

**It shows who holds the prefix today, not who owned your box.** `PONU` was P&O Nedlloyd's prefix. Search it now and you get Maersk A/S in Copenhagen. That is a correct answer to the question the register is actually answering, and a misleading answer to the question most people think they are asking. The register is a live directory of current code holders, not a chain of title for your container.

**Defunct lines vanish completely.** `HJCU` was Hanjin Shipping, which went bankrupt in 2016. On August 27, 2026 the register returned "No code found." Plenty of used boxes in Midwest yards carry the prefixes of carriers that no longer exist, and their prefixes are simply gone from the register.

**A miss means nothing.** No result is not evidence of a stolen box, a fake number or a problem of any kind. A retired code is one common explanation.

Note also that BIC deliberately does not do container-number lookups here. The register page tells you so directly: "Please use www.bic-boxtech.org to look up specific container numbers." Which is step 3.

## Step 3: Is this box flagged? (FREE ACCOUNT REQUIRED)

This is the step that justifies the whole exercise, and it is the one with a signup gate. Say it plainly: **BoxTech has no anonymous search.** There is no public search box on the site. BIC's own documentation states that "once you are logged into BoxTech as a `consumer` you will have the facility to search for containers from the BoxTech database." Registration is open to anyone, free, and email-verified. BIC's FAQ says "anyone can sign up to access the information," and describes the service as "provided to the industry as a free to use service."

**[BoxTech](https://www.bic-boxtech.org/)** ([sign up](https://app.bic-boxtech.org/sign-up)) (free account required)

You need the complete, valid container number, not just the prefix. BIC's docs are explicit: "You can only search for valid and complete container numbers in BoxTech." That is why step 1 comes first.

A hit returns factory technical data: manufacture date, manufacturer, tare weight, maximum gross mass, allowable stacking load, racking values, ISO size and type, one-door-off information, and full internal, external and door dimensions.

### The four alerts

Here is the reason to bother. BoxTech displays container alerts to any logged-in searcher. BIC's documentation defines four, quoted directly:

- **Sold:** "The container has been sold by the BIC Code Holder and is no longer part of their owned fleet, containers that have been sold should be remarked by the new owner if they are to continue circulation for international movements."
- **Scrapped:** the "intention is that the container has been or is being disposed of."
- **Lost:** "whilst it is still in their fleet the whereabouts of the container are currently unknown," and "anyone finding this container should contact the BIC Code Holder."
- **Stolen:** "the theft of the container has been reported to authorities and a police report filed. Anyone finding this container should contact the BIC Code Holder."

There is no US national stolen-container registry. This is the closest thing that exists, and it is free. Run the number before money changes hands, not after the box is on your pad.

Importantly, a sold container is not necessarily deleted from the database. BIC's docs state: "In all cases BoxTech will continue to show the container details for the container, but in all cases the alert type and text will be provided when active."

### The public record of sale

There is a second feature buyers should know about. BIC's documentation: "It is possible to make a declaration of sale for containers where you are not the BIC Code Holder... the container will be shown with an alert to indicate you have made a 'public record of sale', the date of this alert will also be timestamped by BoxTech and viewable by anyone searching for the container."

In other words, after you buy, you can file a timestamped, publicly visible declaration that you bought that container. It is not a title and it is not registration, but it is a dated public marker attached to the box's number, filed by you, in the industry's own database. That is worth more than nothing if a dispute ever arises.

### What a blank result means: nothing

Coverage is partial and voluntary, and that is not our opinion, it is a regulator's. The UK Maritime and Coastguard Agency's Marine Information Note [MIN 633 (M)](https://assets.publishing.service.gov.uk/media/5f242082e90e071a603d3402/MIN_633.pdf), published July 2020, states at section 2.4: "Participation in the BoxTech system is voluntary." At 2.3 it puts a number on it: "The global container fleet is estimated to be over 25 million units and, as of September 2019, BoxTech contained data on approximately 45% of these."

BIC currently describes BoxTech as holding "over 15 million containers." We are deliberately not turning that into a 2026 percentage, because no current, citable figure for total global fleet size exists to divide it by.

So: roughly half the world's boxes, by the last figure a regulator put in writing, and participation is opt-in. Expect a real chance of no result. A miss tells you nothing about your container. It certainly does not mean the box is clean, and it does not mean it is dirty either.

One more limit worth stating outright. BoxTech does hold inspection-date, next-inspection-date and certificate-expired fields, and all three are gated behind a `CertificateViewer` permission that an ordinary free account does not carry. BoxTech is not a CSC examination-status lookup for the public.

## Step 4: The plate on the door, and the ACEP number

Open the left-hand door and find the metal plate riveted near the bottom. This is the CSC Safety Approval Plate.

### What the plate must say

Under the convention as amended by IMO Resolution MSC.355(92), the plate must carry the following in at least English or French:

1. "CSC SAFETY APPROVAL"
2. Country of approval and approval reference
3. Date (month and year) of manufacture
4. Manufacturer's identification number of the container, or the number allotted by the Administration
5. Maximum operating gross mass, in kg and lbs
6. Allowable stacking load for 1.8 g, in kg and lbs
7. Transverse racking test force, in newtons

Some plates add end-wall or side-wall strength values, and one-door-off stacking and racking values where the container is approved for that operation.

### The plate does not expire

Look for an expiry date on the plate and you will not find one, because there is no such field. US regulations at 49 CFR 451.23(b) require the plate to be designed to "remain legible for the working life of the container," and to have "a legible life expectancy equal to or greater than the life expectancy of the container to which the plate is affixed." A container built before 1 July 2014 may keep its pre-2014 plate as long as it has not been structurally modified.

What lapses is the examination status, and that lives somewhere else entirely.

### Approval and examination are two different checks

The cleanest statement of this comes from IMO Resolution MSC.310(88), Annex III, which limits port-state control to "verifying that the container carries a valid Safety Approval Plate, and an approved continuous examination programme (ACEP) or a valid Next Examination Date (NED) marking, unless there is significant evidence for believing that the condition of the container is such as to create an obvious risk to safety."

Read the structure: a valid **plate**, AND (**ACEP** OR **NED**). Two checks, not one.

On the US side, 49 CFR 452.1 sets examination intervals at "not more than 30 months," with a five-year first interval for new containers, and requires the owner to mark "the month and year before which the container must next be examined" on or near the plate. Falsely marking an unexamined container is a violation of 18 U.S.C. 1001. Alternatively, 49 CFR 452.7(b) says the owner "must mark the container with the letters 'ACEP/USA/(year continuous examination program is approved)' to indicate the container is being periodically examined under an approved continuous examination program."

So if your plate area carries an ACEP marking or a programme number, you can go look that programme up.

### The ACEP lookup (no account, no login)

**[BIC Global ACEP Database](https://www.bic-acep.org/)** (free, fully public)

This is the only step in the whole walkthrough with no signup gate at all. There is a Login item in the navigation, but it is for national administrations and approving authorities who file and audit the records, not for you.

Why does this database exist? IMO Resolution MSC.310(88), adopted 3 December 2010 and in force 1 January 2012, added the requirement that "Administrations shall make information on approved Continuous Examination Programmes publicly available," and that programmes "should be reviewed once every 10 years to ensure their continued viability." Note carefully what that obliges: administrations must publish, somewhere. BIC's database is the vehicle IMO has encouraged them to use, per CSC.1/Circ.143 and CSC.1/Circ.138/Rev.1, not a vehicle IMO has mandated. Some administrations publish elsewhere.

**How to search it,** as the site rendered on August 27, 2026: the home page redirects to a search page headed "Welcome to the ACEP Database." Four mode buttons sit above a single search box: Search by ACEP number, Search by container prefix, Search by organization, Search by country. All modes except country accept partial entries. There is also a "Can't find the number?" link under the box.

You can also deep-link a prefix search directly: `https://www.bic-acep.org/prefix-search/MSCU`.

Results come back as a table with four columns: ACEP NUMBER, CONTAINER OPERATOR(S), DELIVERING AUTHORITY, ADMINISTRATION.

Three real searches, run August 27, 2026:

- `MSCU` returned one row: ACEP number `I/RI/99/CS/118/TO`, operator MSC Mediterranean Shipping Company S.A., delivering authority RINA, administration Comando Generale delle Capitanerie di Porto.
- `TGHU` returned **two** rows: `ACEP-BDA 02` and `ACEP-BDA-01`, both Textainer Equipment Management Limited, both delivered and administered by the Bermuda Shipping and Maritime Authority.
- `HJCU`, the defunct Hanjin prefix, returned a plain "No results found."

Two things to take from that. A prefix can map to more than one programme, so do not assume one container equals one ACEP record. And look at the ADMINISTRATION column: Italy in one case, Bermuda in the other. These are foreign government programmes belonging to fleet operators.

### What a hit actually proves, in BIC's own words

A hit proves that a named operator holds an approved examination programme with that number, issued by a named administration, with audit dates on record. That is all it proves.

It does not prove that your container is, or ever was, in that programme. The database is a register of programmes and operators, not of containers. BIC says so itself, twice, in its own documentation:

> "The fact that an ACEP is not present in the database DOES NOT MEAN that an ACEP is not valid, it just mean that the country in charge is not publishing its ACEP yet using the database."

> "As enforced by the Convention for Safe Containers, the ACEP programs are delivered to Container Operators without consideration of the prefixes carried by the containers they operate. Consequently, the information on prefixes provided by the database are just informational and should not be taken into consideration as far as the validity of the ACEP programs are concerned."

Combine that with a fact we have covered before: ACEP coverage belongs to the fleet, and it ends when the container is sold out of the fleet. So a used-container buyer who finds their plate's ACEP number in the database has learned that the seller's former fleet had a valid programme. About the box in their own yard, they have learned nothing.

A miss proves even less, per BIC's first disclaimer above.

## The honest wall

After all four lookups, here is exactly what you can and cannot say about the container in front of you.

**You can establish:**

- The ID number is internally consistent and correctly formed.
- Which company holds that owner prefix today, or that nobody does.
- Whether the container appears in BoxTech, and if so its factory specifications: build date, manufacturer, tare, max gross, stacking and racking ratings, ISO type and full dimensions.
- Whether it carries a Sold, Scrapped, Lost or Stolen alert.
- That an ACEP number on the plate traces to a real operator under a real administration.

**You cannot establish, at any price, without a physical examination:**

- Current CSC examination status. The BoxTech certificate fields are permission-gated, the ACEP database is programme-level, and a missing NED decal is simply unreadable.
- Structural condition: corner castings, posts, top and bottom rails, cross members, floor, doors, gaskets, weathertightness.
- Repair and damage history.
- Whether the plate on that door even belongs to that container.
- Whether any ocean carrier would accept it.

That list is not a gap in the tools. It is the reason 49 CFR 452.3 requires examinations to be "performed by qualified personnel, trained and experienced in the detection of container structural damage." Some questions only get answered by someone standing under the box with a light. If you genuinely need that, our [container inspector finder](/find-a-container-inspector/) lists the IICL-certified roster by state.

## Where Steel Box Direct sits on this

We sell wind and watertight used containers for storage and domestic use across Ohio, Indiana, Kentucky and western West Virginia. We do not sell certified-for-shipping boxes, and we do not tell anyone their storage container needs certifying, because it does not. Our [condition guide](/condition/) explains what WWT means and what it does not.

If your box will hold tools, feed, inventory or equipment on your own property, you can do all four of these lookups purely out of curiosity, get nothing back from three of them, and be perfectly fine. The one we would actually recommend to every used-container buyer is step 3: make the free BoxTech account and run the number for a Stolen or Lost alert before you hand over money. That is two minutes of work with a real downside if you skip it.

Everything else on this page is provenance, not compliance. Know the difference and you will not get talked into paying for either one.

---

*Tool interfaces and lookup results in this post were verified live on August 27, 2026. Databases are updated continuously and results may differ.*
