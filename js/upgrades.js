const UPGS = {
    mass: {
        cols: 4,
        temp() {
            for (let x = this.cols; x >= 1; x--) {
                let d = tmp.upgs.mass
                let data = this.getData(x)
                d[x].cost = data.cost
                d[x].bulk = data.bulk
                
                d[x].bonus = this[x].bonus?this[x].bonus():E(0)
                d[x].eff = this[x].effect(player.massUpg[x]||E(0))
                d[x].effDesc = this[x].effDesc(d[x].eff)
            }
        },
        autoSwitch(x) {
            player.autoMassUpg[x] = !player.autoMassUpg[x]
        },
        buy(x, manual=false) {
            let cost = manual ? this.getData(x).cost : tmp.upgs.mass[x].cost
            if (player.mass.gte(cost)) {
                if (!player.mainUpg.bh.includes(1)) player.mass = player.mass.sub(cost)
                if (!player.massUpg[x]) player.massUpg[x] = E(0)
                player.massUpg[x] = player.massUpg[x].add(1)
            }
        },
        buyMax(x) {
            let d = tmp.upgs.mass[x]
            let bulk = d.bulk
            let cost = d.cost
            if (player.mass.gte(cost)) {
                let m = player.massUpg[x]
                if (!m) m = E(0)
                m = m.max(bulk.floor().max(m.plus(1)))
                player.massUpg[x] = m
                if (!player.mainUpg.bh.includes(1)) player.mass = player.mass.sub(cost)
            }
        },
        getData(i) {
            let upg = this[i]
            let inc = upg.inc
            let start = upg.start
            let lvl = player.massUpg[i]||E(0)
            let cost, bulk

            if (i==4) {
                cost = mlt(inc.pow(lvl).mul(start))
                bulk = player.mass.div(1.5e56).max(1).log10().div(start.mul(1e9)).max(1).log(inc).add(1).floor()
                if (player.mass.lt(start)) bulk = E(0)
            } else {
                if (i == 1 && player.ranks.rank.gte(2)) inc = inc.pow(0.8)
                if (i == 2 && player.ranks.rank.gte(3)) inc = inc.pow(0.8)
                if (i == 3 && player.ranks.rank.gte(4)) inc = inc.pow(0.8)
                if (player.ranks.tier.gte(3)) inc = inc.pow(0.8)
                cost = inc.pow(lvl.scaleEvery("massUpg")).mul(start)
                bulk = E(0)
                if (player.mass.gte(start)) bulk = player.mass.div(start).max(1).log(inc).scaleEvery("massUpg",true).add(1).floor()
            }
        
            return {cost: cost, bulk: bulk}
        },
        1: {
            unl() { return player.ranks.rank.gte(1) || player.mainUpg.atom.includes(1) },
            title: "Muscler",
            start: E(7.5),
            inc: E(1.5),
            effect(x) {
                let step = E(3)
                if (player.ranks.rank.gte(2)) step = step.add(RANKS.effect.rank[2]())
                step = step.mul(tmp.upgs.mass[2]?tmp.upgs.mass[2].eff.eff:1)
                let ret = step.mul(x.add(tmp.upgs.mass[1].bonus))
                return {step: step, eff: ret}
            },
            effDesc(eff) {
                return {
                    step: "+"+formatMass(eff.step),
                    eff: "+"+formatMass(eff.eff)+" to mass gain"
                }
            },
            bonus() {
                let x = E(0)
                if (player.mainUpg.rp.includes(1)) x = x.add(tmp.upgs.main?tmp.upgs.main[1][1].effect:E(0))
                if (player.mainUpg.rp.includes(2)) x = x.add(tmp.upgs.mass[2].bonus)
				 if (player.mainUpg.rp.includes(6)) x.add(tmp.upgs.mass[4].bonus)
                x = x.mul(getEnRewardEff(4))
                return x
            },
        },
        2: {
            unl() { return player.ranks.rank.gte(2) || player.mainUpg.atom.includes(1) },
            title: "Booster",
            start: E(100),
            inc: E(4),
            effect(x) {
                let step = E(2)
                if (player.ranks.rank.gte(3)) step = step.add(RANKS.effect.rank[3]())
                step = step.pow(tmp.upgs.mass[3]?tmp.upgs.mass[3].eff.eff:1)
                let ret = step.mul(x.add(tmp.upgs.mass[2].bonus)).add(1)//.softcap("ee14",0.95,2)
                return {step: step, eff: ret}
            },
            effDesc(eff) {
                return {
                    step: "+"+format(eff.step)+"x",
                    eff: "x"+format(eff.eff)+" to Muscler Power"
                }
            },
            bonus() {
                let x = E(0)
                if (player.mainUpg.rp.includes(2)) x = x.add(tmp.upgs.main?tmp.upgs.main[1][2].effect:E(0))
								if (player.mainUpg.rp.includes(6)) x.add(tmp.upgs.mass[4].bonus)
                x = x.mul(getEnRewardEff(4))
                return x
            },
        },
        3: {
            unl() { return player.ranks.rank.gte(3) || player.mainUpg.atom.includes(1) },
            title: "Stronger",
            start: E(1000),
            inc: E(9),
            effect(x) {
                let xx = x.add(tmp.upgs.mass[3].bonus)
                if (hasElement(81)) xx = xx.pow(1.1)
                let ss = E(50)
                if (player.ranks.rank.gte(34)) ss = ss.add(2)
                if (player.mainUpg.bh.includes(9)) ss = ss.add(tmp.upgs.main?tmp.upgs.main[2][9].effect:E(0))
                let step = E(1).add(RANKS.effect.tetr[2]())
			                step = step.mul(tmp.upgs.mass[4]?tmp.upgs.mass[4].eff.eff:1)
				if (player.ranks.rank.gte(8)) step = step.add(RANKS.effect.rank[8]())
                if (player.mainUpg.rp.includes(9)) step = step.add(0.75)
                if (player.mainUpg.rp.includes(12)) step = step.add(tmp.upgs.main?tmp.upgs.main[1][12].effect:E(0))
                if (hasElement(4)) step = step.mul(tmp.elements.effect[4])
                if (player.md.upgs[3].gte(1)) step = step.mul(tmp.md.upgs[3].eff)
                let sp = 0.5
                if (player.mainUpg.atom.includes(9)) sp *= 1.15
                if (player.ranks.tier.gte(30)) sp *= 1.1
                let sp2 = 0.1
                let ss2 = E(5e10)
                if (hasElement(85)) {
                    sp2 **= 0.3
                    ss2 = ss2.mul(3)
                }
                let ret = step.mul(xx.mul(hasElement(80)?25:1)).add(1).softcap(ss,sp,0).softcap(1.8e5,hasPrestige(0,12)?0.525:0.5,0).softcap(1.8e7,hasTree("c16")?0.15:0.5,0)
                ret = ret.mul(tmp.prim.eff[0][0])
                if (!player.ranks.pent.gte(15)) ret = ret.softcap(ss2,sp2,0)
                return {step: step, eff: ret, ss: ss}
            },
            effDesc(eff) {
                return {
                    step: "+^"+format(eff.step),
                    eff: "^"+format(eff.eff)+" to Booster Power"+(eff.eff.gte(eff.ss)?` <span class='soft'>(softcapped${eff.eff.gte(1.8e5)?eff.eff.gte(5e15)&&!player.ranks.pent.gte(15)?"^3":"^2":""})</span>`:"")
                }
            },
            bonus() {
                let x = E(0)
				if (player.mainUpg.rp.includes(7)) x = x.add(tmp.upgs.main?tmp.upgs.main[1][7].effect:E(0))
				if (player.mainUpg.rp.includes(6)) x = x.add(tmp.upgs.mass[4].bonus)
                x = x.mul(getEnRewardEff(4))
                return x
            },
        },
        4: {
            unl() { return player.ranks.rank.gte(10)},
            title: "Powered",
            start: E(1.e-7).div(6),
            inc: E(3),
            effect(x) {
                let xx = x.add(tmp.upgs.mass[4].bonus)
                let ss = E(10)
                let step = E(1.5).add(RANKS.effect.tier[20]())
                if (hasElement(131)) step = E(1.5).mul(xx.div(5)).add(RANKS.effect.tier[20]())
                let sp = 0.5
                let sp2 = 0.1
                let ss2 = E(100000)
                let ret = step.mul(xx).add(1).softcap(ss,sp,0)
                if (hasTree("c1")) ret = step.mul(xx).add(1).mul(hasTree("c18")?tmp.supernova.tree_eff.c18:1).softcap(ss2,sp2,0)
                return {step: step, eff: ret, ss: ss}
            },
            effDesc(eff) {
                return {
                    step: "+x"+format(eff.step),
                    eff: "x<span style='font-size: 11px;'>"+format(eff.eff)+" to Stronger Power</span>"+(eff.eff.gte(eff.ss)?` <span class='soft' style='font-size: 11px;'>(softcapped${eff.eff.gte(10)?eff.eff.gte(100000)&&!player.ranks.pent.gte(15)?"^3":"^2":""})</span>`:"")
                }
            },
            bonus() {
                let x = E(0)
if (player.mainUpg.rp.includes(5)) x = x.add(1)
                x = x.mul(getEnRewardEff(4))
                return x
            },
        },
    },
    sing: {
        cols: 3,
        temp() {
            for (let x = this.cols; x >= 1; x--) {
                let d = tmp.upgs.sing
                let data = this.getData(x)
                d[x].cost = data.cost
                d[x].bulk = data.bulk
                
                d[x].bonus = this[x].bonus?this[x].bonus():E(0)
                d[x].eff = this[x].effect(player.sUpg[x]||E(0))
                d[x].effDesc = this[x].effDesc(d[x].eff)
            }
        },
        autoSwitch(x) {
            player.autoSingUpg[x] = !player.autoSingUpg[x]
        },
        buy(x, manual=false) {
            let cost = manual ? this.getData(x).cost : tmp.upgs.sing[x].cost
            if (player.qu.s.gte(cost)) {
                player.qu.s = player.qu.s.sub(cost)
                if (!player.sUpg[x]) player.sUpg[x] = E(0)
                player.sUpg[x] = player.sUpg[x].add(1)
            }
        },
        buyMax(x) {
            let d = tmp.upgs.sing[x]
            let bulk = d.bulk
            let cost = d.cost
            if (player.qu.s.gte(cost)) {
                let m = player.sUpg[x]
                if (!m) m = E(0)
                m = m.max(bulk.floor().max(m.plus(1)))
                player.sUpg[x] = m
                player.qu.s = player.qu.s.sub(cost)
            }
        },
        getData(i) {
            let upg = this[i]
            let inc = upg.inc
            let start = upg.start
            let lvl = player.sUpg[i]||E(0)
            let cost, bulk


                cost = inc.pow(lvl.scaleEvery("sUpg")).mul(start)
                bulk = E(0)
                if (player.qu.s.gte(start)) bulk = player.qu.s.div(start).max(1).log(inc).scaleEvery("sUpg",true).add(1).floor()
        
            return {cost: cost, bulk: bulk}
        },
        1: {
            unl() { return player.ranks.rank.gte(1) || player.mainUpg.atom.includes(1) },
            title: "Encoder",
            start: E(3),
            inc: E(1.15),
            effect(x) {
                let step = E(3).mul((hasElement(131))?12.5:1)
                step = step.mul(tmp.upgs.sing[2]?tmp.upgs.sing[2].eff.eff:1)
                let ret = step.mul(x.add(tmp.upgs.sing[1].bonus))
                return {step: step, eff: ret}
            },
            effDesc(eff) {
                return {
                    step: "^"+format(eff.step),
                    eff: "^"+format(eff.eff)+" to Quarks"
                }
            },
            bonus() {
                let x = E(0)
                return x
            },
        },
        2: {
            unl() { return player.ranks.rank.gte(2) || player.mainUpg.atom.includes(1) },
            title: "Encrypter",
            start: E(600),
            inc: E(2),
            effect(x) {
                let step = E(1.2)
                step = step.mul(tmp.upgs.sing[3]?tmp.upgs.sing[3].eff.eff:1)
                let ret = step.mul(x.add(tmp.upgs.sing[2].bonus).add(1))//.softcap("ee14",0.95,2)
                return {step: step, eff: ret}
            },
            effDesc(eff) {
                return {
                    step: "x"+format(eff.step)+"",
                    eff: "x"+format(eff.eff)+" to Encoder Power"
                }
            },
            bonus() {
                let x = E(0)
                return x
            },
        },
        3: {
            unl() { return player.ranks.rank.gte(3) || player.mainUpg.atom.includes(1) },
            title: "Recoder",
            start: E(10000),
            inc: E(3),
            effect(x) {
                let xx = x.add(tmp.upgs.sing[3].bonus)
                let ss = E(50)
                let step = E(1.5)
                let sp = 0.5
                let sp2 = 0.1
                let ss2 = E(5e10)
                if (hasElement(85)) {
                    sp2 **= 0.3
                    ss2 = ss2.mul(3)
                }
                let ret = step.mul(xx).add(1).softcap(ss,sp,0)
                if (!player.ranks.pent.gte(15)) ret = ret.softcap(ss2,sp2,0)
                return {step: step, eff: ret, ss: ss}
            },
            effDesc(eff) {
                return {
                    step: "x"+format(eff.step) + "",
                    eff: "x"+format(eff.eff)+" to Encrypter Power"+(eff.eff.gte(eff.ss)?` <span class='soft'>(softcapped${eff.eff.gte(1.8e5)?eff.eff.gte(5e15)&&!player.ranks.pent.gte(15)?"^3":"^2":""})</span>`:"")
                }
            },
            bonus() {
                let x = E(0)
                return x
            },
        },
    },
    main: {
        temp() {
            for (let x = 1; x <= this.cols; x++) {
                for (let y = 1; y <= this[x].lens; y++) {
                    let u = this[x][y]
                    if (u.effDesc) tmp.upgs.main[x][y] = { effect: u.effect(), effDesc: u.effDesc() }
                }
            }
        },
        ids: [null, 'rp', 'bh', 'atom', 'br','sg'],
        cols: 5,
        over(x,y) { player.main_upg_msg = [x,y] },
        reset() { player.main_upg_msg = [0,0] },
        1: {
            title: "Rage Upgrades",
            res: "Rage Power",
            getRes() { return player.rp.points },
            unl() { return player.rp.unl },
            can(x) { return player.rp.points.gte(this[x].cost) && !player.mainUpg.rp.includes(x) },
            buy(x) {
                if (this.can(x)) {
                    player.rp.points = player.rp.points.sub(this[x].cost)
                    player.mainUpg.rp.push(x)
                }
            },
            auto_unl() { return player.mainUpg.bh.includes(5) },
            lens: 15,
            1: {
                desc: "Boosters adds Musclers.",
                cost: E(1),
                effect() {
                    let ret = E(player.massUpg[2]||0)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "+"+format(x,0)+" Musclers"
                },
            },
            2: {
                desc: "Strongers adds Boosters.",
                cost: E(10),
                effect() {
                    let ret = E(player.massUpg[3]||0)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "+"+format(x,0)+" Boosters"
                },
            },
            3: {
                desc: "You can automatically buys mass upgrades.",
                cost: E(25),
            },
            4: {
                desc: "Ranks no longer resets anything.",
                cost: E(50),
            },
            5: {
                desc: "You can automatically rank up, and get free [Powered] level.",
                cost: E(60),
				                effect() {
                    let ret = E(1)
                    return ret
                },
				effDesc(x=this.effect()) {
                    return "+"+format(x,0)+" Powered"
                },
            },
            6: {
                desc: "You can automatically tier up, and Powered adds to Everything",
                cost: E(1300),
								                effect() {
                    let ret = E(player.massUpg[4]||0)
                    return ret
                },
				effDesc(x=this.effect()) {
                    return "+"+format(x,0)+" All"
                },
            },
            7: {
                desc: "For every 3 tickspeeds adds Stronger.",
                cost: E(55000),
                effect() {
                    let ret = player.tickspeed.div(3).add(hasElement(38)?tmp.elements.effect[38]:0).floor()
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "+"+format(x,0)+" Stronger"
                },
            },
            8: {
                desc: "Super, Hyper Mass Upgrades scaling is weaker by Rage Points.",
                cost: E(182000),
                effect() {
                    let ret = E(0.9).pow(player.rp.points.max(1).log10().max(1).log10().pow(1.25).softcap(2.5,0.5,0))
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(E(1).sub(x).mul(100))+"% weaker"+(x.log(0.9).gte(2.5)?" <span class='soft'>(softcapped)</span>":"")
                },
            },
            9: {
                unl() { return player.bh.unl },
                desc: "Stronger Power is added +^0.75.",
                cost: E(1.65e15),
            },
            10: {
                unl() { return player.bh.unl },
                desc: "Super Rank scaling is 20% weaker.",
                cost: E(8.25e22),
            },
            11: {
                unl() { return player.chal.unl },
                desc: "Black Hole mass's gain is boosted by Rage Points.",
                cost: E(2e36),
                effect() {
                    let ret = player.rp.points.add(1).root(10).softcap('e4000',0.1,0)
                    return ret//.softcap("ee13",0.9,2)
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x"+(x.gte("e4000")?" <span class='soft'>(softcapped)</span>":"")
                },
            },
            12: {
                unl() { return player.chal.unl },
                desc: "For every OoM of Rage Powers adds Stronger Power at a reduced rate.",
                cost: E(1e95),
                effect() {
                    let ret = player.rp.points.max(1).log10().softcap(200,0.75,0).div(1000)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "+^"+format(x)+(x.gte(0.2)?" <span class='soft'>(softcapped)</span>":"")
                },
            },
            13: {
                unl() { return player.chal.unl },
                desc: "Mass gain softcap starts 3x later for every Rank you have.",
                cost: E(1e130),
                effect() {
                    let ret = E(3).pow(player.ranks.rank)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "x"+format(x)
                },
            },
            14: {
                unl() { return player.atom.unl },
                desc: "Hyper Tickspeed starts 50 later.",
                cost: E('e260'),
            },
            15: {
                unl() { return player.atom.unl },
                desc: "Mass boost Atom gain.",
                cost: E('e340'),
                effect() {
                    let ret = player.mass.max(1).log10().pow(1.25)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "x"+format(x)
                },
            },
        },
        2: {
            title: "Black Hole Upgrades",
            res: "Dark Matter",
            getRes() { return player.bh.dm },
            unl() { return player.bh.unl },
            auto_unl() { return player.mainUpg.atom.includes(2) },
            can(x) { return player.bh.dm.gte(this[x].cost) && !player.mainUpg.bh.includes(x) },
            buy(x) {
                if (this.can(x)) {
                    player.bh.dm = player.bh.dm.sub(this[x].cost)
                    player.mainUpg.bh.push(x)
                }
            },
            lens: 15,
            1: {
                desc: "Mass Upgrades no longer spends mass.",
                cost: E(1),
            },
            2: {
                desc: "Tickspeeds boosts BH Condenser Power.",
                cost: E(3),
                effect() {
                    let ret = player.tickspeed.add(1).root(8)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x"
                },
            },
            3: {
                desc: "Super Mass Upgrade scales later based on mass of Black Hole.",
                cost: E(4),
                effect() {
                    let ret = player.bh.mass.max(1).log10().pow(0.2).softcap(100,1/3,0).floor()
                    return ret.min(400)
                },
                effDesc(x=this.effect()) {
                    return "+"+format(x,0)+" later"+(x.gte(100)?" <span class='soft'>(softcapped)</span>":"")
                },
            },
            4: {
                desc: "Tiers no longer resets anything.",
                cost: E(250),
            },
            5: {
                desc: "You can automatically buy tickspeed and Rage Power upgrades, and 1.50x [Tickspeed] effect",
                cost: E(650),
            },
            6: {
                desc: "Gain 100% of Rage Power gained from reset per second. Rage Powers are boosted by mass of Black Hole.",
                cost: E(2e6),
                effect() {
                    let ret = player.bh.mass.max(1).log10().add(1).pow(2)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x"
                },
            },
            7: {
                unl() { return player.chal.unl },
                desc: "Mass gain softcap start later based on mass of Black Hole.",
                cost: E(5e12),
                effect() {
                    let ret = player.bh.mass.add(1).root(3)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x later"
                },
            },
            8: {
                unl() { return player.chal.unl },
                desc: "Raise Rage Power gain by 1.15.",
                cost: E(2e13),
            },
            9: {
                unl() { return player.chal.unl },
                desc: "Stronger Effect's softcap start later based on unspent Dark Matters.",
                cost: E(1e27),
                effect() {
                    let ret = player.bh.dm.max(1).log10().pow(0.5)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "+"+format(x)+" later"
                },
            },
            10: {
                unl() { return player.chal.unl },
                desc: "Mass gain is boosted by OoM of Dark Matters.",
                cost: E(2e32),
                effect() {
                    let ret = E(2).pow(player.bh.dm.add(1).log10().softcap(11600,0.5,0))
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x"+(x.max(1).log2().gte(11600)?" <span class='soft'>(softcapped)</span>":"")
                },
            },
            11: {
                unl() { return player.atom.unl },
                desc: "Mass gain softcap is 10% weaker.",
                cost: E(1e80),
            },
            12: {
                unl() { return player.atom.unl },
                desc: "Hyper Tickspeed scales 15% weaker.",
                cost: E(1e120),
            },
            13: {
                unl() { return player.atom.unl },
                desc: "Quark gain is multiplied by 10.",
                cost: E(1e180),
            },
            14: {
                unl() { return player.atom.unl },
                desc: "Neutron Powers boosts mass of Black Hole gain.",
                cost: E(1e210),
                effect() {
                    let ret = player.atom.powers[1].add(1).pow(2)
                    return ret//.softcap("ee13",0.9,2)
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x"
                },
            },
            15: {
                unl() { return player.atom.unl },
                desc: "Atomic Powers adds Black Hole Condensers at a reduced rate.",
                cost: E('e420'),
                effect() {
                    let ret = player.atom.atomic.add(1).log(5).softcap(2e9,0.25,0).softcap(1e10,0.1,0)
                    return ret.floor()
                },
                effDesc(x=this.effect()) {
                    return "+"+format(x,0)
                },
            },
        },
        3: {
            title: "Atom Upgrades",
            res: "Atom",
            getRes() { return player.atom.points },
            unl() { return player.atom.unl },
            can(x) { return player.atom.points.gte(this[x].cost) && !player.mainUpg.atom.includes(x) },
            buy(x) {
                if (this.can(x)) {
                    player.atom.points = player.atom.points.sub(this[x].cost)
                    player.mainUpg.atom.push(x)
                }
            },
            auto_unl() { return hasTree("qol1") },
            lens: 15,
            1: {
                desc: "Start with Mass upgrades unlocked.",
                cost: E(1),
            },
            2: {
                desc: "You can automatically buy BH Condenser and upgrades. Tickspeed no longer spent Rage Powers.",
                cost: E(100),
            },
            3: {
                desc: "[Tetr Era] Unlock Tetr.",
                cost: E(25000),
            },
            4: {
                desc: "Keep 1-4 Challenge on reset. BH Condensers adds Cosmic Rays Power at a reduced rate.",
                cost: E(1e6),
                effect() {
                    let ret = player.bh.condenser.pow(0.8).mul(0.01)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "+"+format(x)+"x"
                },
            },
            5: {
                desc: "You can automatically Tetr up. Super Tier starts 10 later.",
                cost: E(1e7),
            },
            6: {
                desc: "Gain 100% of Dark Matters gained from reset per second. Mass gain from Black Hole softcap starts later based on Atomic Powers.",
                cost: E(1e11),
                effect() {
                    let ret = player.atom.atomic.add(1).pow(0.5)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x later"
                },
            },
            7: {
                desc: "Tickspeed boost each particle powers gain.",
                cost: E(2e19),
                effect() {
                    let ret = E(1.025).pow(player.tickspeed)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x"
                },
            },
            8: {
                desc: "Atomic Powers boosts Quark gain.",
                cost: E(1e25),
                effect() {
                    let ret = player.atom.atomic.max(1).log10().add(1)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x"
                },
            },
            9: {
                desc: "Stronger effect softcap is 15% weaker.",
                cost: E(4e26),
            },
            10: {
                desc: "Tier requirement is halved. Hyper Rank starts later based on Tiers you have.",
                cost: E(5e44),
                effect() {
                    let ret = player.ranks.tier.mul(2).floor()
                    return ret
                },
                effDesc(x=this.effect()) {
                    return "+"+format(x,0)+" later"
                },
            },
            11: {
                unl() { return MASS_DILATION.unlocked() },
                desc: "Dilated mass also boost BH Condenser & Cosmic Ray powers at a reduced rate.",
                cost: E('e1640'),
                effect() {
                    let ret = player.md.mass.max(1).log10().add(1).pow(0.1)
                    return ret
                },
                effDesc(x=this.effect()) {
                    return format(x)+"x"
                },
            },
            12: {
                unl() { return MASS_DILATION.unlocked() },
                desc: "Mass from Black Hole effect is better.",
                cost: E('e2015'),
            },
            13: {
                unl() { return player.md.break.active && player.qu.rip.active },
                desc: "Cosmic Ray effect softcap starts x10 later.",
                cost: E('e3.2e11'),
            },
            14: {
                unl() { return player.md.break.active && player.qu.rip.active },
                desc: "Tickspeed, Black Hole Condenser and Cosmic Ray scalings up to Meta start x10 later.",
                cost: E('e4.3e13'),
            },
            15: {
                unl() { return player.md.break.active && player.qu.rip.active },
                desc: "Reduce Cosmic Ray scaling by 20%.",
                cost: E('e3.4e14'),
            },
        },
        4: {
            title: "Big Rip Upgrades",
            res: "Death Shard",
            getRes() { return player.qu.rip.amt },
            unl() { return player.qu.rip.first },
            can(x) { return player.qu.rip.amt.gte(this[x].cost) && !player.mainUpg.br.includes(x) },
            buy(x) {
                if (this.can(x)) {
                    player.qu.rip.amt = player.qu.rip.amt.sub(this[x].cost)
                    player.mainUpg.br.push(x)
                }
            },
            auto_unl() { return false },
            lens: 16,
            1: {
                desc: `Start with Hydrogen-1 unlocked in Big Rip.`,
                cost: E(5),
            },
            2: {
                desc: `Mass Upgrades & Ranks are no longer nerfed by 8th QC modifier.`,
                cost: E(10),
            },
            3: {
                desc: `Pre-Quantum Global Speed is raised based on Death Shards (before division).`,
                cost: E(50),
                effect() {
                    let x = player.qu.rip.amt.add(1).log10().div(25).add(1)
                    return x
                },
                effDesc(x=this.effect()) { return "^"+format(x) },
            },
            4: {
                desc: `Start with 2 tiers of each Fermion in Big Rip.`,
                cost: E(250),
            },
            5: {
                desc: `Reduce Star Booster’s starting cost to ^0.1. Star Booster’s base is increased based on Death Shards.`,
                cost: E(2500),
                effect() {
                    let x = player.qu.rip.amt.add(1).log10().add(1).pow(3)
                    return x
                },
                effDesc(x=this.effect()) { return "x"+format(x) },
            },
            6: {
                desc: `Start with all Radiation features unlocked.`,
                cost: E(15000),
            },
            7: {
                desc: `Hybridized Uran-Astatine is twice effective, while Big Ripped.`,
                cost: E(100000),
            },
            8: {
                desc: `Passively gain 10% of Quantum Foams & Death Shards you would get from resetting each second.`,
                cost: E(750000),
            },
            9: {
                desc: `Unlock Break Dilation.`,
                cost: E(1e6),
            },
            10: {
                unl() { return player.md.break.active },
                desc: `Chromas are 10% stronger.`,
                cost: E(2.5e8),
            },
            11: {
                unl() { return player.md.break.active },
                desc: `Prestige Level no longer resets anything.`,
                cost: E(1e10),
            },
            12: {
                unl() { return player.md.break.active },
                desc: `Mass gain softcap^5 starts later based on Atom.`,
                cost: E(1e16),
                effect() {
                    let x = player.atom.points.add(1).log10().add(1).log10().add(1).root(3)
                    return x
                },
                effDesc(x=this.effect()) { return "^"+format(x)+" later" },
            },
            13: {
                unl() { return player.md.break.active },
                desc: `Death Shard gain is boosted based on Prestige Base.`,
                cost: E(1e17),
                effect() {
                    let x = (tmp.prestiges.base||E(1)).add(1).log10().tetrate(1.5).add(1)
                    return x
                },
                effDesc(x=this.effect()) { return "x"+format(x) },
            },
            14: {
                unl() { return player.md.break.active },
                desc: `Super Fermion Tier starts 10 later (after QC8 nerf).`,
                cost: E(1e22),
            },
            15: {
                unl() { return player.md.break.active },
                desc: `Blueprint Particles give slightly more Pre-Quantum Global Speed.`,
                cost: E(1e23),
            },
            16: {
                unl() { return player.md.break.active },
                desc: `Stardust boosts Star Booster at reduced amount (stronger in Big Rip)`,
                cost: E(1e32),
                effect() {
                    let x = player.supernova.stardust.pow(1.55)
                    if (player.qu.rip.active) x = player.supernova.stardust.pow(120.55)
                    return x
                },
                effDesc(x=this.effect()) { return "x"+format(x) },
            },
        },
        5: {
            title: "Singularity Upgrades",
            res: "Singularity",
            getRes() { return player.qu.s },
            unl() { return player.qu.sTimes.gte(1)},
            can(x) { return player.qu.s.gte(this[x].cost) && !player.mainUpg.sg.includes(x) },
            buy(x) {
                if (this.can(x)) {
                    player.qu.s = player.qu.s.sub(this[x].cost)
                    player.mainUpg.sg.push(x)
                }
            },
            auto_unl() { return false },
            lens: 3,
            1: {
                desc: `Stardust are boosted by Quarks.`,
                cost: E(150),
                effect() {
                    let x = player.atom.quarks.add(1).log(20).pow(0.125).max(1)
                    return x
                },
                effDesc(x=this.effect()) { return "x"+format(x) },
            },
            2: {
                desc: `Singularity adds Prestige Exponent. (Only in C13)`,
                cost: E(1250),
                effect() {
                    if (CHALS.inChal(13)) x = player.qu.s.log(1.5).pow(0.35).softcap(3,0.1,0)
                    else return E(0)
                    return x
                },
                effDesc(x=this.effect()) { return "+"+format(x) },
            },
            3: {
                desc: `Delta [D] Particles will obtain 2 new effects and equal its Level to Primordium Theorems amount. (Only in C13)`,
                cost: E(7500),
            },
        },
    },
}

/*
1: {
    desc: "Placeholder.",
    cost: E(1),
    effect() {
        let ret = E(1)
        return ret
    },
    effDesc(x=this.effect()) {
        return format(x)+"x"
    },
},
*/

function hasUpgrade(id,x) { return player.mainUpg[id].includes(x) }
function upgEffect(id,x,def=E(1)) { return tmp.upgs.main[id][x]?tmp.upgs.main[id][x].effect:def }