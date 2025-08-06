/**
 * Finds all documents that match the specified `query`.
 * Sorts results by `_id` in ascending order.
 * Skips the specified number of documents (`skip`) and limits
 * the number of documents returned (`limit`).
 *
 * @param {Object} query - The query object used for filtering.
 * @param {number} skip - The number of documents to skip.
 * @param {number} limit - The maximum number of documents to return.
 * @returns {Promise<Array>} - A promise that resolves to the list of matching documents.
 */
export async function crudFind(query, skip, limit) {

    const items = await db.collection(collectionName)
        .find(query)
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)

    return items.toArray()
}
