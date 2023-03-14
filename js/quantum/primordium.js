const PRIM = {
    unl() { return hasTree('unl2') },
    getTheorems() {
        let b = tmp.prim.t_base
        let x = player.qu.bp.max(1).log(b).mul(6).scale(10,2,true).mul(hasPrestige(1,28)?2:1)
        return x.floor()
    },
    getNextTheorem() {
        let b = tmp.prim.t_base
        let x = E(b).pow(player.qu.prim.theorems.scale(10,2).div(6).add(1))

        return x
    },
    spentTheorems() {
        let x = E(0)
        for (let i = 0; i < player.qu.prim.particles.length; i++) x = x.add(player.qu.prim.particles[i])
        return x
    },
    particle: {
        names: ["Delta [Δ]","Alpha [Α]","Omega [Ω]","Sigma [Σ]","Phi [Φ]","Epsilon [Ε]","Theta [Θ]","Beta [Β]"],
        weight: [6,6,6,2,2,2,1],
        total_w: 31,
        chance: [],

        eff: [
            p=>{
                let x = [p.add(1).root(2),CHALS.inChal(13)?E(2).pow(p.add(1).root(7).pow(0.75)):1,CHALS.inChal(13)?E(1).mul(p.add(1).root(10).pow(0.25)):0]
                return x
            },
            p=>{
                let x = [p.root(3).div(5).add(1),p.pow(1.25).add(1)]
                return x
            },
            p=>{
                let x = [p.root(3).div(5).add(1),E(3).pow(p.pow(0.75))]
                return x
            },
            p=>{
                let x = [p.root(3).div(5).add(1),E(2).pow(p.pow(0.75))]
                return x
            },
            p=>{
                let x = p.add(1).root(10)
                return x
            },
            p=>{
                let x = [p.root(3).div(10), p.root(3).pow(QCs.active()?2:1)]
                return x
            },
            p=>{
                let x = [E(5).pow(p.pow(0.75)), p.root(5).div(10).add(1)]
                return x
            },
            p=>{
                if (hasElement(107)) p = p.mul(2)
                let x = p.pow(0.9).mul(2)
                return x
            },
        ],
        effDesc: [
            x=>{ return `Boost Stronger Power by ${format(x[0])}x /<br> Boost Singularity gain by ${format(x[1])}x /<br> Adds Prestige Exponent. +${format(x[2])}` },
            x=>{ return `Boost Rage Powers gain by ^${format(x[0])} /<br> Boost Non-Bonus Tickspeed by ${format(x[1])}x` },
            x=>{ return `Boost Dark Matters gain by ^${format(x[0])} /<br> Boost BH Condenser Power by ${format(x[1])}x` },
            x=>{ return `Boost Atoms gain by ^${format(x[0])} /<br> Boost Cosmic Ray Power by ${format(x[1])}x` },
            x=>{ return `Boost Higgs Boson's effect by ${format(x)}x` },
            x=>{ return `Add ${format(x[0])} to base from Fermions gain ` + (hasTree("prim3") ? ` /<br> Add ${format(x[1])} free tiers to Fermions` : "") },
            x=>{ return `Boost all Radiations gains by ${format(x[0])}x` + (hasTree("prim2") ? ` /<br> Make all Radiations effects ${format(x[1])}x stronger` : "") },
            x=>{ return `Make all Supernova's scalings start ${format(x)} later` },
        ],
    },
}

function giveRandomPParticles(v, max=false) {
    if (hasUpgrade('sg',3) && PRIM.particle.weight[0]){
		PRIM.particle.weight[0]=0;
		PRIM.particle.total_w-=6;
        calcPartChances();
    }
    if (!PRIM.unl()) return

    let s = max?tmp.prim.unspent:E(v)
    if (!max) s = s.min(tmp.prim.unspent)

    let tw = PRIM.particle.total_w
    let s_div = s.div(tw).floor()
    let sm = s.mod(tw).floor().toNumber()

    for (let x in PRIM.particle.names) player.qu.prim.particles[x] = player.qu.prim.particles[x].add(s_div.mul(PRIM.particle.weight[x]))
    for (let x = 0; x < sm; x++) {
        let c = Math.random()
        for (let y in PRIM.particle.chance) if (c <= PRIM.particle.chance[y]) {
            player.qu.prim.particles[y] = player.qu.prim.particles[y].add(1)
            break
        }
    }

    updatePrimordiumTemp()
}
function equalPPtoL(id) {
	let res = E(0)
	if (hasUpgrade('sg',3) && id == 0) res = player.qu.prim.theorems,player.qu.prim.particles[0] = E(0)
	if (hasPrestige(1,4)) res = res.add(5)
    if (hasPrestige(1,22)) res = res.add(player.qu.prim.theorems.div(15))
	return res
}
function respecPParticles() {
    if (confirm("Are you sure you want to respec all Particles?")) {
        for (let i =0; i < 8; i++) player.qu.prim.particles[i] = E(0)
        QUANTUM.doReset()
    }
}

function calcPartChances() {
    var sum = 0
    for (let x in PRIM.particle.names) {
        sum += PRIM.particle.weight[x]
        PRIM.particle.chance[x] = sum / PRIM.particle.total_w
    }
}

calcPartChances()

function updatePrimordiumTemp() {
    tmp.prim.t_base = E(5)
    if (hasTree('prim1')) tmp.prim.t_base = tmp.prim.t_base.sub(1)
    tmp.prim.theorems = PRIM.getTheorems()
    tmp.prim.next_theorem = PRIM.getNextTheorem()
    tmp.prim.unspent = player.qu.prim.theorems.sub(PRIM.spentTheorems()).max(0)
    for (let i = 0; i < player.qu.prim.particles.length; i++) {
        let pp = equalPPtoL(i)
		pp = pp.add(player.qu.prim.particles[i])
        if (player.qu.rip.active) pp = pp.mul(i==5?hasElement(95)?0.1:0:1/2)
        tmp.prim.eff[i] = PRIM.particle.eff[i](pp.softcap(100,0.75,0))
    }
    }

function updatePrimordiumHTML() {
    tmp.el.prim_theorem.setTxt(format(tmp.prim.unspent,0)+" / "+format(player.qu.prim.theorems,0))
    tmp.el.prim_next_theorem.setTxt(format(player.qu.bp,1)+" / "+format(tmp.prim.next_theorem,1))
    for (let i = 0; i < player.qu.prim.particles.length; i++) {
        if (equalPPtoL(i).gt(0))tmp.el["prim_part"+i].setTxt(format(player.qu.prim.particles[i],0)+" + "+format(equalPPtoL(i),0))
        tmp.el["prim_part_eff"+i].setHTML(PRIM.particle.effDesc[i](tmp.prim.eff[i]))
    }
}