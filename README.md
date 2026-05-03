# YV Japan Buy Quest

A mobile-first Japan shopping quest tracker built for one person to use during a Japan trip.

The app is not a general itinerary app. It exists to help YV track every item she wants to buy, every store where it might be available, what to check each day, what to check in each store, and what backup stores to try if something is sold out.

## Core product promise

“I am in Shibuya today. Show me what I still need to check here. If something is sold out, show me where else I can get it.”

## Non-negotiable principles

- Mobile-first.
- Fast to use while standing in a shop.
- Big status buttons.
- Cute but clean.
- No login.
- No database for v1.
- Data stored in localStorage.
- Import/export JSON backup.
- Never make her edit spreadsheet-like rows on mobile.
- Separate Items from Store Options.

## Data model

### Item

An Item is the thing she wants.

Fields:
- id
- name
- category
- who
- priority
- qtyWanted
- qtyBought
- notes
- referenceLink
- imageUrl
- overallStatus

Priority values:
- S
- A
- B
- C

Overall status:
- Still looking
- Partly bought
- Bought
- Abandoned

### StoreOption

A StoreOption is one possible place to get an item.

Fields:
- id
- itemId
- store
- city
- area
- bestDay
- backupRank
- status
- priceEstimate
- actualPrice
- mapLink
- notes
- airportFallback

Store status:
- Not checked
- Found
- Sold out
- Not found
- Check later
- Bought here
- Skip

## Main screens

### 1. Today View

Shows active shopping quests for a chosen day, grouped by area and store.

Must include filters:
- Day
- City
- Area
- Priority
- Who

Each card must show:
- Item name
- Who
- Priority
- Quantity progress
- Store
- Area
- Backup rank
- Notes
- Status

Each card must have large quick actions:
- Bought
- Sold out
- Not found
- Later
- Skip

### 2. Store View

Shows all items to check in a selected store.

Must answer:
“I am physically inside this store. What am I looking for?”

Grouped by store, with quick actions for every item.

### 3. Item Lookup

Search or select an item and show every store option for that item.

When an item is marked Sold out at one store, this view must clearly show the next best backup stores sorted by:
1. Not checked / Found / Check later first
2. Same day
3. Same city
4. Backup rank
5. Airport fallback last

### 4. Bought List

Shows all bought items.

Grouped by:
- Who
- Category
- Store
- Day

Must include:
- Total spent
- Packed checkbox
- Actual price
- Quantity bought

### 5. Add Item

Quick add flow:
- Item name
- Who
- Store
- City
- Area
- Best day
- Priority
- Save

Advanced fields:
- Category
- Qty wanted
- Price estimate
- Backup rank
- Notes
- Map link
- Reference link
- Airport fallback

Must include:
- Add another store for this item
- Duplicate item detection

### 6. Settings / Backup

Must include:
- Export JSON
- Import JSON
- Reset sample data
- Clear all data with confirmation

## Categories

- Shoes
- Blind boxes / toys
- Anime / character goods
- Snacks
- Food gifts
- Tea / matcha / hojicha
- Beauty / skincare
- Homeware / kitchenware
- Clothes
- Stationery / stickers
- Electronics / gadgets
- Baby/kids gifts
- Convenience store items
- Airport gifts
- Other

## Visual direction

The app should feel like a cute Japan travel quest log, not a corporate dashboard.

Mood:
- Pokémon quest log
- Japanese stationery
- soft travel scrapbook
- tiny luxury mobile app
- playful but not childish

Design:
- Mobile-first layout
- Bottom navigation
- Rounded 2xl cards
- Soft shadows
- Cream/off-white background
- Pastel category badges
- Priority badges
- Big tactile buttons
- Smooth Framer Motion transitions
- Empty states with warm copy
- Good spacing
- Easy to use with one thumb

Avoid:
- Spreadsheet grids
- Tiny text
- Too many colours
- Corporate dashboard feel
- Desktop-first layouts

## MVP acceptance criteria

The app is complete when:

- User can create an item.
- User can add multiple stores for one item.
- User can view items by day.
- User can view items by store.
- User can search an item and see all backup stores.
- User can mark one store as Sold out and see other available locations.
- User can mark an item as Bought.
- Quantity bought updates correctly.
- Bought list shows bought items and total spend.
- Data persists after refresh.
- User can export and import JSON backup.
- App works well on iPhone/Android viewport.