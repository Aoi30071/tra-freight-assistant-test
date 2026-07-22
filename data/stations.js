// ==========================================
// 全台車站資料
// 與車班無關
// 僅保存車站基本資料
// ==========================================

export const stations = {

    /*
     * line
     *   幹線
     *   山線
     *   海線
     *   集集線
     *   支線
     *   專線
     *
     * mileages
     *   trunk   縱貫線里程
     *   sea     海線里程
     *   jiji    集集線里程
     */

    新竹貨: {
        line: "幹線",
        mileages: {
            trunk: 101.6
        }
    },

    新竹: {
        line: "幹線",
        mileages: {
            trunk: 102.7
        }
    },

    竹南: {
        line: "幹線",
        mileages: {
            trunk: 121.7,
            sea: 0.0
        },
        junction: true
    },

    苗栗: {
        line: "山線",
        mileages: {
            trunk: 136.9
        }
    },

    銅鑼: {
        line: "山線",
        mileages: {
            trunk: 147.7
        }
    },

    三義: {
        line: "山線",
        mileages: {
            trunk: 155.1
        }
    },

    后里: {
        line: "山線",
        mileages: {
            trunk: 168.6
        }
    },

    豐原: {
        line: "山線",
        mileages: {
            trunk: 175.4
        }
    },

    潭子: {
        line: "山線",
        mileages: {
            trunk: 180.4
        }
    },

    臺中: {
        line: "山線",
        mileages: {
            trunk: 189.6
        }
    },

    新烏日: {
        line: "山線",
        mileages: {
            trunk: 197.6
        }
    },

    成功: {
        line: "山線",
        mileages: {
            trunk: 200.1
        }
    },

    彰化: {
        line: "幹線",
        mileages: {
            trunk: 207.2,
            sea: 90.2
        },
        junction: true
    },

    員林: {
        line: "幹線",
        mileages: {
            trunk: 221.9
        }
    },

    社頭: {
        line: "幹線",
        mileages: {
            trunk: 229.1
        }
    },

    田中: {
        line: "幹線",
        mileages: {
            trunk: 233.4
        }
    },

    二水: {
        line: "幹線",
        mileages: {
            trunk: 239.2
        },
        junction: true
    },

    林內: {
        line: "幹線",
        mileages: {
            trunk: 247.3
        }
    },

    斗六: {
        line: "幹線",
        mileages: {
            trunk: 256.9
        }
    },

    斗南: {
        line: "幹線",
        mileages: {
            trunk: 264.5
        }
    },

    大林: {
        line: "幹線",
        mileages: {
            trunk: 273.0
        }
    },

    民雄: {
        line: "幹線",
        mileages: {
            trunk: 278.8
        }
    },

    嘉義: {
        line: "幹線",
        mileages: {
            trunk: 288.1
        }
    },

    新營: {
        line: "幹線",
        mileages: {
            trunk: 311.1
        }
    },

    隆田: {
        line: "幹線",
        mileages: {
            trunk: 324.1
        }
    },

    善化: {
        line: "幹線",
        mileages: {
            trunk: 331.1
        }
    },

    新市: {
        line: "幹線",
        mileages: {
            trunk: 338.1
        }
    },

    永康: {
        line: "幹線",
        mileages: {
            trunk: 343.1
        }
    },

    台南: {
        line: "幹線",
        mileages: {
            trunk: 350.1
        }
    },

    保安: {
        line: "幹線",
        mileages: {
            trunk: 357.1
        }
    },

    中洲: {
        line: "幹線",
        mileages: {
            trunk: 361.1
        }
    },

    大湖: {
        line: "幹線",
        mileages: {
            trunk: 364.1
        }
    },

    路竹: {
        line: "幹線",
        mileages: {
            trunk: 367.1
        }
    },

    岡山: {
        line: "幹線",
        mileages: {
            trunk: 375.1
        }
    },

    橋頭: {
        line: "幹線",
        mileages: {
            trunk: 379.1
        }
    },

    楠梓: {
        line: "幹線",
        mileages: {
            trunk: 383.1
        }
    },

    新左營: {
        line: "幹線",
        mileages: {
            trunk: 388.1
        }
    },

    高雄: {
        line: "幹線",
        mileages: {
            trunk: 396.1
        }
    },

    // =============================
    // 海線
    // =============================

    後龍: { line: "海線", mileages: { sea: 15.0 } },
    白沙屯: { line: "海線", mileages: { sea: 26.7 } },
    通霄: { line: "海線", mileages: { sea: 35.6 } },
    苑裡: { line: "海線", mileages: { sea: 41.7 } },
    大甲: { line: "海線", mileages: { sea: 54.0 } },
    臺中港: { line: "海線", mileages: { sea: 59.3 } },
    清水: { line: "海線", mileages: { sea: 65.3 } },
    沙鹿: { line: "海線", mileages: { sea: 68.5 } },
    龍井: { line: "海線", mileages: { sea: 73.1 } },
    大肚: { line: "海線", mileages: { sea: 78.1 } },
    追分: { line: "海線", mileages: { sea: 83.1 } },

    // =============================
    // 集集線
    // =============================

    源泉: {
        line: "集集線",
        parent: "二水",
        mileages: {
            jiji: 3.0
        }
    },

    濁水: {
        line: "集集線",
        parent: "二水",
        mileages: {
            jiji: 10.8
        }
    },

    龍泉: {
        line: "集集線",
        parent: "二水",
        mileages: {
            jiji: 15.7
        }
    },

    集集: {
        line: "集集線",
        parent: "二水",
        mileages: {
            jiji: 20.0
        }
    },

    水里: {
        line: "集集線",
        parent: "二水",
        mileages: {
            jiji: 27.4
        }
    },

    車埕: {
        line: "集集線",
        parent: "二水",
        mileages: {
            jiji: 29.6
        }
    },

    // =============================
    // 支線／專線
    // =============================

    中興支線: {
        line: "支線",
        parent: "二水",
        branchLength: 16
    },

    中港區: {
        line: "支線",
        parent: "臺中港",
        branchLength: 13
    }

};
