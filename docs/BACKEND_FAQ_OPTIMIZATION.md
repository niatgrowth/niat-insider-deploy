# Backend FAQ API optimization (apply in Replit / NIAT-Insider)

The deploy proxy calls `GET /api/faqs/` (optional `?limit=N`).  
**12s for ~10 rows is almost entirely Django/DB time** — frontend cannot fix that without a faster upstream response.

## Recommended changes in `NIAT-Insider/qa/views.py`

### 1. Support `?limit=` on `FAQListView`

```python
def get(self, request):
    qs = (
        Question.objects.filter(is_faq=True)
        .select_related("author")
        .prefetch_related(_answers_prefetch())
        .order_by("faq_order", "-created_at")
    )
    limit = request.query_params.get("limit")
    if limit:
        try:
            qs = qs[: max(1, min(int(limit), 50))]
        except ValueError:
            pass
    # ... rest unchanged
```

### 2. Lighter serializer for list (optional but high impact)

`FAQSerializer` extends `QuestionDetailSerializer` and serializes **all** answers with vote lookups per answer — heavy for a home-page preview.

Add a slim serializer used only on `/api/faqs/`:

```python
class FAQPreviewSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    answer = serializers.SerializerMethodField()  # single primary answer only

    class Meta:
        model = Question
        fields = [
            "id", "slug", "title", "body", "category",
            "is_answered", "faq_order", "created_at", "author", "answer",
        ]

    def get_author(self, obj):
        return {"username": obj.author.username, "id": str(obj.author.id)}

    def get_answer(self, obj):
        first = obj.answers.order_by("created_at").first()
        if not first:
            return None
        return {
            "id": str(first.id),
            "body": first.body,
            "created_at": first.created_at,
            "author": {"username": first.author.username},
        }
```

Use `FAQPreviewSerializer` in `FAQListView` instead of `FAQSerializer`.

### 3. Prefetch only the first answer (advanced)

```python
def _faq_answers_prefetch():
    return Prefetch(
        "answers",
        queryset=Answer.objects.order_by("created_at").select_related("author")[:1],
    )
```

Or keep full prefetch but rely on slim serializer without per-answer vote queries.

### 4. Database indexes

Ensure indexes exist on:

- `Question.is_faq`
- `Question.faq_order`

```python
# migrations — if missing
models.Index(fields=["is_faq", "faq_order"]),
```

### 5. Categories endpoint (fast fix)

`GET /api/questions/categories/` already returns a static classifier list — should be **&lt;50ms**. If slow, check auth middleware or remote DB latency, not query complexity.

---

After backend deploys `limit`, the Insider proxy already forwards `?limit=8` from the reviews home FAQ section.
