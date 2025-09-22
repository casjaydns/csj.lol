const app = new Vue({
  el: '#app',
  data: {
    urls: [],
    loading: false,
    error: '',
    pagination: {
      page: 1,
      limit: 50,
      totalPages: 1,
      totalUrls: 0,
      hasNext: false,
      hasPrev: false
    },
    sort: 'newest',
    perPage: 50,
    baseUrl: ''
  },
  computed: {
    displayedPages() {
      const pages = [];
      const current = this.pagination.page;
      const total = this.pagination.totalPages;

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }

      return pages;
    }
  },
  mounted() {
    this.baseUrl = `${window.location.protocol}//${window.location.host}`;
    this.loadUrls();
  },
  methods: {
    async loadUrls(page = 1) {
      this.loading = true;
      this.error = '';

      try {
        const response = await fetch(`/api/urls?page=${page}&limit=${this.perPage}&sort=${this.sort}`);

        if (response.ok) {
          const data = await response.json();
          this.urls = data.urls;
          this.pagination = data.pagination;
        } else {
          this.error = 'Failed to load URLs. Please try again later.';
        }
      } catch (err) {
        this.error = 'An error occurred while loading URLs.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.loadUrls(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    changePerPage() {
      this.loadUrls(1);
    },

    formatDate(id) {
      if (!id) return 'Unknown';
      try {
        const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      } catch (err) {
        return 'Unknown';
      }
    },

    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        const originalText = event.target.textContent;
        event.target.textContent = 'Copied!';
        event.target.classList.add('bg-dracula-green');
        setTimeout(() => {
          event.target.textContent = originalText;
          event.target.classList.remove('bg-dracula-green');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }
});