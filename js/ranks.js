const RANKS = {
    names: ['rank', 'tier', 'tetr', 'pent','sept'],
    fullNames: ['Rank', 'Tier', 'Tetr', 'Pent','Sept'],
    reset(type) {
        if (tmp.ranks[type].can) {
            player.ranks[type] = player.ranks[type].add(1)
            let reset = true
            if (type == "rank" && player.mainUpg.rp.includes(4)) reset = false
            if (type == "tier" && player.mainUpg.bh.includes(4)) reset = false
            if (type == "tetr" && hasTree("qol5")) reset = false
            if (type == "pent" && hasTree("qol8")) reset = false
            if (type == "sept" && player.md.break.upgs[12].gte(1)) reset = false
            if (reset) this.doReset[type]()
            updateRanksTemp()
        }
    },
    bulk(type) {
        if (tmp.ranks[type].can) {
            player.ranks[type] = player.ranks[type].max(tmp.ranks[type].bulk.max(player.ranks[type].add(1)))
            let reset = true
            if (type == "rank" && player.mainUpg.rp.includes(4)) reset = false
            if (type == "tier" && player.mainUpg.bh.includes(4)) reset = false
            if (type == "tetr" && hasTree("qol5")) reset = false
            if (type == "pent" && hasTree("qol8")) reset = false
			if (type == "sept" && player.md.break.upgs[12].gte(1)) reset = false
            if (reset) this.doReset[type]()
            updateRanksTemp()
        }
    },
    unl: {
        tier() { return player.ranks.rank.gte(3) || player.ranks.tier.gte(1) || player.mainUpg.atom.includes(3) || tmp.radiation.unl },
        tetr() { return player.mainUpg.atom.includes(3) || tmp.radiation.unl },
        pent() { return tmp.radiation.unl },
        sept() { return player.md.break.upgs[12].gte(1) },
    },
    doReset: {
        rank() {
            player.mass = E(0)
            for (let x = 1; x <= UPGS.mass.cols; x++) if (player.massUpg[x]) player.massUpg[x] = E(0)
        },
        tier() {
            player.ranks.rank = E(0)
            this.rank()
        },
        tetr() {
            player.ranks.tier = E(0)
            this.tier()
        },
        pent() {
            player.ranks.tetr = E(0)
            this.tetr()
        },
       sept() {
            player.ranks.pent = E(0)
            this.pent()
        },
    },
    autoSwitch(rn) { player.auto_ranks[rn] = !player.auto_ranks[rn] },
    autoUnl: {
        rank() { return player.mainUpg.rp.includes(5) },
        tier() { return player.mainUpg.rp.includes(6) },
        tetr() { return player.mainUpg.atom.includes(5) },
        pent() { return hasTree("qol8") },
        sept() { return player.md.break.upgs[12].gte(1) },
    },
    desc: {
        rank: {
            '1': "unlock mass upgrade 1.",
            '2': "unlock mass upgrade 2, reduce mass upgrade 1 cost scaled by 20%, mass upgrade 1 boosts itself.",
            '3': "unlock mass upgrade 3, reduce mass upgrade 2 cost scaled by 20%, mass upgrade 2 boosts itself.",
            '4': "reduce mass upgrade 3 cost scale by 20%.",
            '5': "mass upgrade 2 boosts itself, 10x mass gain",
            '6': "make mass gain is boosted by (x+1)^2, where x is rank.",
			'7': "8.00x mass gain",
			'8': "mass upgrade 3 boosts itself massively",
			'10': "unlock mass upgrade 4",
            '13': "triple mass gain.",
            '14': "double Rage Powers gain.",
            '17': "make rank 6 reward effect is better. [(x+1)^2 -> (x+1)^x^1/3]",
            '34': "make mass upgrade 3 softcap start 1.2x later.",
            '40': "adds tickspeed power based on ranks.",
            '45': "ranks boosts Rage Powers gain.",
            '90': "rank 40 reward is stronger.",
            '180': "mass gain is raised by 1.025.",
            '220': "rank 40 reward is overpowered.",
            '300': "rank multiplie quark gain.",
            '380': "rank multiplie mass gain.",
            '800': "make mass gain softcap 0.25% weaker based on rank.",
        },
        tier: {
            '1': "reduce rank reqirements by 20%.",
            '2': "raise mass gain by 1.15",
            '3': "reduce all mass upgrades cost scale by 20%.",
            '4': "adds +5% tickspeed power for every tier you have, softcaps at +40%.",
            '6': "make rage powers boosted by tiers.",
            '8': "make tier 6's reward effect stronger by dark matters.",
            '12': "make tier 4's reward effect twice effective and remove softcap.",
			            '20': "mass upgrade 4 boosts itself.",
            '30': "stronger effect's softcap is 10% weaker.",
            '55': "make rank 380's effect stronger based on tier.",
            '100': "Super Tetr scale 5 later.",
        },
        tetr: {
            '1': "reduce tier reqirements by 25%, make Hyper Rank scaling is 15% weaker.",
            '2': "mass upgrade 3 boosts itself.",
            '3': "raise tickspeed effect by 1.05.",
            '4': "Super Rank scale weaker based on Tier, Super Tier scale 20% weaker.",
            '5': "Hyper/Ultra Tickspeed starts later based on tetr.",
            '8': "Mass gain softcap^2 starts ^1.5 later.",
        },
        pent: {
            '1': "reduce tetr reqirements by 15%, make Meta-Rank starts 1.1x later.",
            '2': "tetr boost all radiations gain.",
            '4': "Meta-Tickspeeds start later based on Supernovas.",
            '5': "Meta-Ranks start later based on Pent.",
            '8': "Mass gain softcap^4 starts later based on Pent.",
            '15': "remove 3rd softcap of Stronger's effect.",
        },
        sept: {
            '1': "Boost stardust gain by ((x^3)+x*2) where x is Sept.",
        },
    },
    effect: {
        rank: {
            '2'() {
                let ret = E(player.massUpg[1]||0).div(20).softcap(1e20,0.1,0)
                return ret
            },
            '3'() {
                let ret = E(player.massUpg[2]||0).div(40).softcap(1e20,0.1,0)
                return ret
            },
            '6'() {
                let ret = player.ranks.rank.add(1).pow(player.ranks.rank.gte(17)?player.ranks.rank.add(1).root(3):2)
                return ret
            },
            '8'() {
                let ret = E(player.massUpg[3]||0).div(5).softcap(1e120,0.0001,0)
                return ret
            },
            '40'() {
                let ret = player.ranks.rank.root(2).div(100)
                if (player.ranks.rank.gte(90)) ret = player.ranks.rank.root(1.6).div(100)
                if (player.ranks.rank.gte(220)) ret = player.ranks.rank.div(100)
                return ret
            },
            '45'() {
                let ret = player.ranks.rank.add(1).pow(1.5)
                return ret
            },
            '300'() {
                let ret = player.ranks.rank.add(1)
                return ret
            },
            '380'() {
                let ret = E(10).pow(player.ranks.rank.sub(379).pow(1.5).pow(player.ranks.tier.gte(55)?RANKS.effect.tier[55]():1).softcap(1000,0.5,0))
                return ret
            },
            '800'() {
                let ret = E(1).sub(player.ranks.rank.sub(799).mul(0.0025).add(1).softcap(1.25,0.5,0).sub(1)).max(0.75)
                return ret
            },
        },
        tier: {
            '4'() {
                let ret = E(0)
                if (player.ranks.tier.gte(12)) ret = player.ranks.tier.mul(0.1)
                else ret = player.ranks.tier.mul(0.05).add(1).softcap(1.4,0.75,0).sub(1).softcap(1e110,0.08,0)
                return ret
            },
            '6'() {
                let ret = E(2).pow(player.ranks.tier)
                if (player.ranks.tier.gte(8)) ret = ret.pow(RANKS.effect.tier[8]()).softcap(1e120,0.1,0)
                return ret
            },
            '8'() {
                let ret = player.bh.dm.max(1).log10().add(1).root(2).softcap(1e13,0,0)
                return ret
            },
			            '20'() {
                let ret = E(player.massUpg[4]||0).pow(0.45)
                return ret
            },
            '55'() {
                let ret = player.ranks.tier.max(1).log10().add(1).root(4)
                return ret
            },
        },
        tetr: {
            '2'() {
                let ret = E(player.massUpg[3]||0).div(400)
                return ret
            },
            '4'() {
                let ret = E(0.96).pow(player.ranks.tier.pow(1/3))
                return ret
            },
            '5'() {
                let ret = player.ranks.tetr.pow(4).softcap(1000,0.25,0)
                return ret
            },
        },
        pent: {
            '2'() {
                let ret = E(1.3).pow(player.ranks.tetr)
                return ret
            },
            '4'() {
                let ret = player.supernova.times.add(1).root(5)
                return ret
            },
            '5'() {
                let ret = E(1.05).pow(player.ranks.pent)
                return ret
            },
            '8'() {
                let ret = E(1.1).pow(player.ranks.pent).softcap(50,0.001,0)
                return ret
            },
        },
		sept:{
			            '1'() {
                let ret = player.ranks.sept.add(1).pow(3).add(player.ranks.sept.add(1).mul(2)).softcap(2500,0.1,0)
                return ret
            },
		},
    },
    effDesc: {
        rank: {
            2(x) { return "+"+format(x) },
            3(x) { return "+"+format(x) },
            6(x) { return format(x)+"x" },
			8(x) { return "+"+format(x) },
            40(x) {  return "+"+format(x.mul(100))+"%" },
            45(x) { return format(x)+"x" },
            300(x) { return format(x)+"x" },
            380(x) { return format(x)+"x" },
            800(x) { return format(E(1).sub(x).mul(100))+"% weaker" },
        },
        tier: {
            4(x) { return "+"+format(x.mul(100))+"%" },
            6(x) { return format(x)+"x" },
            8(x) { return "^"+format(x) },
			20(x) { return "+"+format(x) },
            55(x) { return "^"+format(x) },
        },
        tetr: {
            2(x) { return "+"+format(x) },
            4(x) { return format(E(1).sub(x).mul(100))+"% weaker" },
            5(x) { return "+"+format(x,0)+" later" },
        },
        pent: {
            2(x) { return format(x)+"x" },
            4(x) { return format(x)+"x later" },
            5(x) { return format(x)+"x later" },
            8(x) { return "^"+format(x)+" later" },
        },
        sept: {
            1(x) { return format(x)+"x"+(x.gte(2500)?" (softcapped)":"") },
        },
    },
    fp: {
        rank() {
            let f = E(1)
            if (player.ranks.tier.gte(1)) f = f.mul(1/0.8)
            f = f.mul(tmp.chal.eff[5].pow(-1))
            return f
        },
        tier() {
            let f = E(1)
            f = f.mul(tmp.fermions.effs[1][3])
            if (player.ranks.tetr.gte(1)) f = f.mul(1/0.75)
            if (player.mainUpg.atom.includes(10)) f = f.mul(2)
            return f
        },
    },
}

const PRESTIGES = {
    fullNames: ["Prestige Level", "Honor",'Glory'],
    baseExponent() {
        let x = E(0)
        if (hasElement(100))x= x.add(tmp.elements.effect[100])
        if (hasPrestige(0,32))x= x.add(prestigeEff(0,32,0))
        if (hasUpgrade('sg',2) && (CHALS.inChal(13))) x = x.add(player.qu.s.log(1.5).pow(0.35).softcap(4,0.1,0))
        if (hasUpgrade('sg',3)&& (CHALS.inChal(13))) x = x.add(tmp.prim.eff[0][2])
        return x.add(1)
    },
    base() {
        let x = E(1)

        for (let i = 0; i < RANKS.names.length; i++) {
            let r = player.ranks[RANKS.names[i]]
            if (hasPrestige(0,18) && i == 0) r = r.mul(2)
            x = x.mul(r.add(1))
        }

        return x.sub(1)
    },
    req(i) {
        let x = EINF, y = player.prestiges[i]
        switch (i) {
            case 0:
                if (player.prestiges[1].gte(19)) x = Decimal.pow(1.08,y.scaleEvery('prestige0').pow(1.08)).mul(2e13)
               else x = Decimal.pow(1.1,y.scaleEvery('prestige0').pow(1.1)).mul(2e13)
                break;
            case 1:
                x = y.scaleEvery('prestige1').pow(1.25).mul(3).add(4)
                break;
                case 2:
                    x = y.add(1).scaleEvery('prestige2').pow(1.15).mul(2).add(24)
                    break;
            default:
                x = EINF
                break;
        }
        return x.ceil()
    },
    bulk(i) {
        let x = E(0), y = i==0?tmp.prestiges.base:player.prestiges[i-1]
        switch (i) {
            case 0:
                if (player.prestiges[1].gte(19) && y.gte(2e13)) x = y.div(2e13).max(1).log(1.08).max(0).root(1.08).scaleEvery('prestige0',true).add(1)
                if (y.gte(2e13)) x = y.div(2e13).max(1).log(1.1).max(0).root(1.1).scaleEvery('prestige0',true).add(1)
                break;
            case 1:
                if (y.gte(4)) x = y.sub(4).div(2).max(0).root(1.5).scaleEvery('prestige1',true).add(1)
                break
                case 2:
                    if (y.gte(24)) x = y.sub(2).sub(24).div(2).max(0).root(1.45).scaleEvery('prestige1',true).add(1)
                    break
            default:
                x = E(0)
                break;
        }
        return x.floor()
    },
    unl: [
        _=>true,
        _=>true,
        _=>hasPrestige(1,26) || player.prestiges[2].gte(1),
    ],
    noReset: [
        _=>hasUpgrade('br',11),
        _=>hasPrestige(1,19) || player.prestiges[2].gte(1),
        _=>true,
    ],
	    autoUnl: [
        ()=>hasPrestige(1,16)|| player.prestiges[2].gte(1),
        ()=>hasPrestige(1,25)|| player.prestiges[2].gte(1),
        ()=>false,
    ],
    autoSwitch(x) { player.auto_pres[x] = !player.auto_pres[x] },
    rewards: [
        {
            "1": `All Mass softcaps up to ^5 start ^10 later.`,
            "2": `Quantum Shard Base is increased by 0.5.`,
            "3": `Quadruple Quantum Foam and Death Shard gain.`,
            "5": `Pre-Quantum Global Speed is raised by ^2 (before division).`,
            "6": `Tickspeed Power softcap starts ^100 later.`,
            "8": `Mass softcap^5 starts later based on Prestige.`,
            "10": `Gain more Relativistic Energies based on Prestige.`,
            "12": `Stronger Effect's softcap^2 is 7.04% weaker.`,
            "15": `Relativistic Energy is boosted by Relativistic Particles at reduced rate`,
            "18": `Gain 100% more Ranks to Prestige Base.`,
            "24": `Super Cosmic Strings scale 20% weaker.`,
            "28": `Remove all softcaps from Gluon Upgrade 4's effect.`,
            "32": `Prestige Base’s exponent is increased based on Prestige Level.`,
            "40": `Chromium-24 is slightly stronger.`,
            "450": `Re-unlock all Stars.`,
            "465": `Honor-25 is slightly stronger based on Pent.`,
        },
        {
            "1": `All-Star resources are raised by ^2.`,
            "2": `Meta-Supernova starts 100 later.`,
            "3": `Bosonic resources are boosted based on Prestige Base.`,
            "4": `Gain 5 free levels of each Primordium Particle.`,
            "5": `Pent 5's reward is stronger based on Prestige Base.`,
            "7": `Quarks are boosted based on Honor.`,
            "16": "Automate Prestige Level.",
            "18": "Re-unlock first Star.",
            "19": "Prestige Level no longer resets.",
            "20": "Singularized Times boosts Stardust gain",
            "21": "Passively get Singularized Times based on Honor.",
            "22": `Get 2x of Primordium Particles you have.`,
            "23": `Apply Sept effect to passive generation of Singularized Times at reduced rate but x is Pent.`,
            "24": `Double Singularity Gain.`,
            "25": "Automate Honors.",
            "26": "Unlock Glory.",
        },
        {
            "1": "Unlock More Elements and keep Prestige Level, Honor Automation.",
        },
    ],
    rewardEff: [
        {
            "8": [_=>{
                let x = player.prestiges[0].root(2).div(2).add(1)
                return x
            },x=>"^"+x.format()+" later"],
            "10": [_=>{
                let x = Decimal.pow(2,player.prestiges[0])
                return x
            },x=>x.format()+"x"],
            "15": [_=>{
                let x = player.md.mass.max(1).pow(0.65).log(10).max(1).softcap(1e28,0.01,0)
                return x
             }, x=>x.format()+"x"],
            "32": [_=>{
                let x = player.prestiges[0].div(1e4).toNumber()
                return x
            },x=>"+^"+format(x)],
            "465": [_=>{
                let x = player.ranks.pent.add(1).pow(.55).softcap(15,0.3,0).add(1)
                return x
            },x=>"x"+format(x)],
            /*
            "1": [_=>{
                let x = E(1)
                return x
            },x=>{
                return x.format()+"x"
            }],
            */
        },
        {
            "3": [_=>{
                let x = tmp.prestiges.base.max(1).log10().div(10).add(1).root(2).softcap(3,0.001,0)
                return x
            },x=>"^"+x.format()],
            "5": [_=>{
                let x = tmp.prestiges.base.max(1).log10().div(10).add(1).root(3).softcap(2.2,0.005,0)
                return x
            },x=>"x"+x.format()],
            "7": [_=>{
                let x = player.prestiges[1].add(1).root(3).softcap(2.6,0.005,0)
                return x
            },x=>"^"+x.format()],
            "20": [_=>{
                let x = player.qu.sTimes.add(1).pow(1.35).mul(hasElement(130)?tmp.elements.effect[130].eff.div(100).add(1):1).mul(hasPrestige(0,465)?prestigeEff(0,465):1).softcap(45000,0.8,1).max(1)
                return x
            },x=>"x"+x.format()+ (prestigeEff(1,25).gte(45000)?" (softcapped)":"") ],
            "21": [_=>{
                let x = player.prestiges[1].add(1).root(5).mul(hasPrestige(1,23)?prestigeEff(1,23):1).max(1)
                return x
            },x=>"+"+x.format() + "/s"],
            "23": [_=>{
                let x = player.ranks.pent.add(1).pow(0.75).add(player.ranks.pent.add(1).div(2)).mul(hasElement(130)?tmp.elements.effect[130].ret.div(100).add(1):1).softcap(2500,0.1,0)
                return x
            },x=>"x"+x.format()],
        },
        {
        },
    ],
    reset(i) {
        if (i==0?tmp.prestiges.base.gte(tmp.prestiges.req[i]):player.prestiges[i-1].gte(tmp.prestiges.req[i])) {
            player.prestiges[i] = player.prestiges[i].add(1)

            if (!this.noReset[i]()) {
                for (let j = i-1; j >= 0; j--) {
                    player.prestiges[j] = E(0)
                }
                QUANTUM.enter(false,true,false,true)
            }
            
            updateRanksTemp()
        }
    },
}
const PRES_LEN = PRESTIGES.fullNames.length

function hasPrestige(x,y) { return player.prestiges[x].gte(y) }

function prestigeEff(x,y,def=E(1)) { return tmp.prestiges.eff[x][y] || def }

function updateRanksTemp() {
    if (!tmp.ranks) tmp.ranks = {}
    for (let x = 0; x < RANKS.names.length; x++) if (!tmp.ranks[RANKS.names[x]]) tmp.ranks[RANKS.names[x]] = {}
    let fp2 = tmp.qu.chroma_eff[1]
    let fp = RANKS.fp.rank()
    tmp.ranks.rank.req = E(20).pow(player.ranks.rank.div(fp2).scaleEvery('rank').div(fp).pow(1.15)).mul(3.5)
    tmp.ranks.rank.bulk = E(0)
    if (player.mass.gte(20)) tmp.ranks.rank.bulk = player.mass.div(20).max(1).log10().root(1.15).mul(fp).scaleEvery('rank',true).mul(fp2).add(1).floor();
    tmp.ranks.rank.can = player.mass.gte(tmp.ranks.rank.req) && !CHALS.inChal(5) && !CHALS.inChal(10) && !FERMIONS.onActive("03")

    fp = RANKS.fp.tier()
    tmp.ranks.tier.req = player.ranks.tier.div(fp2).scaleEvery('tier').div(fp).add(2).pow(2).floor()
    tmp.ranks.tier.bulk = player.ranks.rank.max(0).root(2).sub(2).mul(fp).scaleEvery('tier',true).mul(fp2).add(1).floor();

    fp = E(1)
    let pow = 2
    if (hasElement(44)) pow = 1.75
    if (hasElement(9)) fp = fp.mul(1/0.85)
    if (player.ranks.pent.gte(1)) fp = fp.mul(1/0.85)
    if (hasElement(72)) fp = fp.mul(1/0.85)
    tmp.ranks.tetr.req = player.ranks.tetr.div(fp2).scaleEvery('tetr').div(fp).pow(pow).mul(3).add(10).floor()
    tmp.ranks.tetr.bulk = player.ranks.tier.sub(10).div(3).max(0).root(pow).mul(fp).scaleEvery('tetr',true).mul(fp2).add(1).floor();

    fp = E(1)
    pow = 1.5
    tmp.ranks.pent.req = player.ranks.pent.scaleEvery('pent').div(fp).pow(pow).add(15).floor()
    tmp.ranks.pent.bulk = player.ranks.tetr.sub(15).gte(0)?player.ranks.tetr.sub(15).max(0).root(pow).mul(fp).scaleEvery('pent',true).add(1).floor():E(0);

    fp = E(1)
    pow = 1.15
    tmp.ranks.sept.req = player.ranks.sept.scaleEvery('sept').div(fp).pow(pow).add(38).floor()
    tmp.ranks.sept.bulk = player.ranks.pent.sub(38).gte(0)?player.ranks.pent.sub(38).max(0).root(pow).mul(fp).scaleEvery('sept',true).add(1).floor():E(0);
    for (let x = 0; x < RANKS.names.length; x++) {
        let rn = RANKS.names[x]
        if (x > 0) {
            tmp.ranks[rn].can = player.ranks[RANKS.names[x-1]].gte(tmp.ranks[rn].req)
        }
    }

    // Prestige

    tmp.prestiges.baseMul = PRESTIGES.base()
    tmp.prestiges.baseExp = PRESTIGES.baseExponent()
    tmp.prestiges.base = tmp.prestiges.baseMul.pow(tmp.prestiges.baseExp).softcap(1e285,0.03,0).max(1)
    for (let x = 0; x < PRES_LEN; x++) {
        tmp.prestiges.req[x] = PRESTIGES.req(x)
        for (let y in PRESTIGES.rewardEff[x]) {
            if (PRESTIGES.rewardEff[x][y]) tmp.prestiges.eff[x][y] = PRESTIGES.rewardEff[x][y][0]()
        }
    }
}

function updateRanksHTML() {
    tmp.el.rank_tabs.setDisplay(hasUpgrade('br',9))
    for (let x = 0; x < 2; x++) {
        tmp.el["rank_tab"+x].setDisplay(tmp.rank_tab == x)
    }

    if (tmp.rank_tab == 0) {
        for (let x = 0; x < RANKS.names.length; x++) {
            let rn = RANKS.names[x]
            let unl = RANKS.unl[rn]?RANKS.unl[rn]():true
            tmp.el["ranks_div_"+x].setDisplay(unl)
            if (unl) {
                let keys = Object.keys(RANKS.desc[rn])
                let desc = ""
                for (let i = 0; i < keys.length; i++) {
                    if (player.ranks[rn].lt(keys[i])) {
                        desc = ` At ${RANKS.fullNames[x]} ${format(keys[i],0)}, ${RANKS.desc[rn][keys[i]]}`
                        break
                    }
                }
    
                tmp.el["ranks_scale_"+x].setTxt(getScalingName(rn))
                tmp.el["ranks_amt_"+x].setTxt(format(player.ranks[rn],0))
                tmp.el["ranks_"+x].setClasses({btn: true, reset: true, locked: !tmp.ranks[rn].can})
                tmp.el["ranks_desc_"+x].setTxt(desc)
                tmp.el["ranks_req_"+x].setTxt(x==0?"[" + formatMass(tmp.ranks[rn].req) + '].':RANKS.fullNames[x-1]+" [" +format(tmp.ranks[rn].req,0) + "].")
                tmp.el["ranks_auto_"+x].setDisplay(RANKS.autoUnl[rn]())
                tmp.el["ranks_auto_"+x].setTxt(player.auto_ranks[rn]?"ON":"OFF")
            }
        }
    }
    if (tmp.rank_tab == 1) {
        tmp.el.pres_base.setHTML(`${tmp.prestiges.baseMul.format(0)}<sup>${format(tmp.prestiges.baseExp)}</sup> = ${tmp.prestiges.base.format(0)}`)
        for (let x = 0; x < PRES_LEN; x++) {
            let unl = PRESTIGES.unl[x]?PRESTIGES.unl[x]():true

            tmp.el["pres_div_"+x].setDisplay(unl)

            if (unl) {
                let p = player.prestiges[x] || E(0)
                let keys = Object.keys(PRESTIGES.rewards[x])
                let desc = ""
                for (let i = 0; i < keys.length; i++) {
                    if (p.lt(keys[i])) {
                        desc = ` At ${PRESTIGES.fullNames[x]} ${format(keys[i],0)}, ${PRESTIGES.rewards[x][keys[i]]}`
                        break
                    }
                }

                tmp.el["pres_scale_"+x].setTxt(getScalingName("prestige"+x))
                tmp.el["pres_amt_"+x].setTxt("[" +format(p,0)+ "]")
                tmp.el["pres_"+x].setClasses({btn: true, reset: true, locked: x==0?tmp.prestiges.base.lt(tmp.prestiges.req[x]):player.prestiges[x-1].lt(tmp.prestiges.req[x])})
                tmp.el["pres_desc_"+x].setTxt(desc)
                tmp.el["pres_req_"+x].setTxt(x==0?"[" + format(tmp.prestiges.req[x],0)+"] of Prestige Base. ":PRESTIGES.fullNames[x-1]+" ["+format(tmp.prestiges.req[x],0) + "].")
                tmp.el["pres_auto_"+x].setDisplay(PRESTIGES.autoUnl[x]())
                tmp.el["pres_auto_"+x].setTxt(player.auto_pres[x]?"ON":"OFF")
            }
        }
    }
}