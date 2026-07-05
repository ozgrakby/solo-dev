<script>
    import { supabase } from '$lib/supabase.js';

    let email = $state('');
    let password = $state('');
    let loading = $state(false);
    let errorMessage = $state('');

    async function handleLogin(e) {
        e.preventDefault();
        loading = true;
        errorMessage = '';

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            errorMessage = 'Login failed: ' + error.message;
            loading = false;
        }
    }
</script>

<div class="flex min-h-screen items-center justify-center bg-arsenal-bg px-4 font-sans select-none">
  <div class="w-full max-w-md rounded-none bg-arsenal-surface p-8 shadow-xl border border-arsenal-border">
    
    <div class="border-b border-arsenal-border pb-4 mb-6 text-center">
        <div class="flex items-center justify-center gap-2 mb-1">
            <span class="status-dot-lime !bg-black"></span>
            <span class="font-mono text-xs font-bold uppercase tracking-widest text-arsenal-text">SYSTEM AUTHENTICATION</span>
        </div>
        <h2 class="text-xl font-mono font-extrabold text-arsenal-text tracking-tight uppercase">SOLO DEV PANEL</h2>
    </div>
    
    {#if errorMessage}
      <div class="mb-4 rounded-none bg-red-500/10 border border-arsenal-red p-3 text-xs font-mono text-arsenal-red">
        [ERROR]: {errorMessage}
      </div>
    {/if}

    <form onsubmit={handleLogin} class="space-y-4">
      <div>
        <label class="text-label" for="email">EMAIL</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          class="input-tactical"
          placeholder="developer@studio.com"
        />
      </div>

      <div>
        <label class="text-label" for="password">PASSWORD</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          class="input-tactical"
          placeholder="••••••••"
        />
      </div>

      <div class="pt-2">
          <button
            type="submit"
            disabled={loading}
            class="btn-tactical w-full !py-2.5"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN →'}
          </button>
      </div>
    </form>
  </div>
</div>