# Backend Document Processing Setup

## Steps to Complete the Setup:

### 1. Run the Migration
```bash
cd your-project-directory
php artisan migrate
```

### 2. Create Storage Link (if not already created)
```bash
php artisan storage:link
```

### 3. Verify File Uploads Directory
Make sure the following directories exist and are writable:
- `storage/app/public/documents/`
- `public/storage/`

### 4. Test the Setup

#### A. Upload Documents in SellUnit Page
1. Go to SellUnit page
2. Select a unit
3. Upload documents (National ID, Contract, Payment Proof)
4. Fill out the form
5. Submit

#### B. Check Database
```sql
-- Check if documents were saved
SELECT * FROM documents WHERE sale_id = [YOUR_SALE_ID];

-- Check sale with documents
SELECT s.*, d.category, d.original_name 
FROM sales s 
LEFT JOIN documents d ON s.id = d.sale_id 
WHERE s.unit_id = [YOUR_UNIT_ID];
```

#### C. Check File Storage
Documents should be stored in:
`storage/app/public/documents/[category]/[filename]`

#### D. Test Frontend Display
1. Go to Units page
2. Click on the sold unit
3. Check the Documents section - should show uploaded files

## Files Created/Updated:

1. **Migration**: `database/migrations/2024_01_15_000001_create_documents_table.php`
2. **Model**: `app/Models/Document.php`
3. **Model**: `app/Models/Sale.php`
4. **Controller**: `app/Http/Controllers/SalesController.php`
5. **Routes**: Added sales routes to `routes/web.php`

## Features Added:

- Document upload and storage
- Document categorization (national_id, contract, payment_proof, other_documents)
- Document retrieval by sale
- File metadata storage (size, mime type, original name)
- Proper error handling and logging
- Database transactions for data integrity

## Troubleshooting:

### If documents don't appear:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify storage permissions
3. Check database for document records
4. Verify storage link exists

### If files don't upload:
1. Check PHP upload limits in `php.ini`
2. Verify form data is being sent (check browser network tab)
3. Check Laravel error logs

### If storage link issues:
```bash
# Remove and recreate storage link
rm public/storage
php artisan storage:link
```
