// Small client-side library: cart + auth helpers + toasts
function getCart(){ try{ return JSON.parse(localStorage.getItem('pmc_cart')||'[]'); }catch(e){ return []; } }
function saveCart(c){ localStorage.setItem('pmc_cart', JSON.stringify(c)); }
function addToCart(item, qty){ const cart = getCart(); const existing = cart.find(x=>x.id==item.id); if (existing) existing.qty += qty; else cart.push({ id: item.id, title: item.title, price: item.price, moq: item.moq||1, qty }); saveCart(cart); }
function clearCart(){ localStorage.removeItem('pmc_cart'); }
function saveAuth(token, user){ localStorage.setItem('pmc_token', token); localStorage.setItem('pmc_user', JSON.stringify(user)); }
function getAuth(){ return { token: localStorage.getItem('pmc_token'), user: JSON.parse(localStorage.getItem('pmc_user')||'null') }; }
function logout(){ localStorage.removeItem('pmc_token'); localStorage.removeItem('pmc_user'); location.reload(); }
