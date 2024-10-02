import { CLIENT_VERSION, SOCKET } from "../constant.js";
import handlerMapping from "../handlers/handlerMapping.js";
import { getGameAssets } from "../init/assets.js";
import { getItemSpace } from "../models/items.model.js";
import { getStage } from "../models/stage.model.js";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const URL = process.env.URL;

const client = createClient({
  url: URL,
});

await client.connect();

class handlerRepository {
  // clientVersion 검사
  clientVersionCheck(clientVersion) {
    try {
      if (!CLIENT_VERSION.includes(clientVersion)) {
        return {
          status: SOCKET.FAIL,
          Message: "클라이언트 버전이 다릅니다.",
        };
      }
    } catch (error) {
      console.log("클라이언트 버전 체크 중 에러 발생", error);
    }
  }

  // handlerId 검사
  handlerIdCheck(socket, handlerId) {
    try {
      const handler = handlerMapping[handlerId];

      if (!handler) {
        socket.emit(SOCKET.RESPONSE, {
          status: SOCKET.FAIL,
          message: "존재하지 않는 HandlerID 입니다.",
        });

        return;
      }

      return handler;
    } catch (error) {
      console.log("HandlerID 검사 중 에러 발생", error);
    }
  }

  // 클라이언트/서버 timeStamp 격차 검사
  timeStampCheck(socket, payload) {
    try {
      const serverTimeStamp = Date.now();

      if (payload.timeStamp) {
        const gap = serverTimeStamp - payload.timeStamp;

        if (gap > process.env.DELAY) {
          console.log(`서버 지연시간이 지나치게 깁니다. ${gap}(ms)`);

          socket.emit(SOCKET.RESPONSE, {
            status: SOCKET.FAIL,
            message: `서버 연결이 불안정 합니다. ${gap}(ms)`,
          });
        }
      }
    } catch (error) {
      console.log("timeStamp검사 중 에러 발생", error);
    }
  }

  // 현재 스테이지 보유 여부 검사
  haveStageCheck(uuid) {
    try {
      const myStages = getStage(uuid);

      if (!myStages.length) {
        return {
          status: SOCKET.FAIL,
          Message: "현재 스테이지 정보가 존재하지 않습니다.",
        };
      }
    } catch (error) {
      console.log("스테이지 정보 검사 중 에러 발생", error);
    }
  }

  // 생성/획득 아이템 일치여부 검사
  itemCheck(uuid, payload) {
    try {
      const createItems = getItemSpace(uuid).createItem.filter(
        (data) => data.itemId === payload.itemId
      );

      const grabedItems = getItemSpace(uuid).grabItem.filter(
        (data) => data.itemId === payload.itemId
      );

      if (createItems.length < grabedItems.length) {
        console.log("생성된적 없는 아이템 획득, uuid: ", uuid);
        console.log("생성 아이템 목록: ", createItems);
        console.log("획득 아이템 목록: ", grabedItems);

        return {
          status: SOCKET.FAIL,
          Message: "생성된적 없는 아이템을 획득하였습니다.",
        };
      }
    } catch (error) {
      console.log("획득/생성 아이템 비교 검사 중 중 에러 발생", error);
    }
  }

  // 올바른 아이템이 생성되었는지 검사
  createItemStageCheck(uuid, payload) {
    const { item_unlocks } = getGameAssets();

    const currentStages = getStage(uuid);
    currentStages.sort((a, b) => a.stage - b.stage);
    const currentStage = currentStages[currentStages.length - 1];

    for (let item_unlock of item_unlocks.data) {
      if (item_unlock.stage_id === currentStage.id) {
        for (let i = 0; i < item_unlock.item.length; i++) {
          if (item_unlock.item[i].item_id === payload.itemId) {
            return;
          }
        }

        console.log("스테이지에 해금 안된 아이템 생성, uuid: ", uuid);
        console.log("스테이지 해금 가능 아이템: ", item_unlock.item);
        console.log("클라이언트 생성 아이템: ", payload);
        return {
          status: SOCKET.FAIL,
          Message: "스테이지에 맞지않는 아이템을 생성하였습니다.",
        };
      }
    }

    return {
      status: SOCKET.FAIL,
      Message: "아이템 해금 스테이지 정보를 찾지 못했습니다.",
    };
  }

  // 아이템 생성 시간 간격 검사
  createItemTime(uuid) {
    const items = getItemSpace(uuid);
    for (let i = 0; i < items.createItem.length - 1; i++) {
      if (
        items.createItem[i + 1].timeStamp - items.createItem[i].timeStamp <
        900
      ) {
        console.log("지나치게 짧은 간격의 아이템 생성, uuid: ", uuid);
        console.log(
          "아이템 생성 간격: ",
          items.createItem[i + 1].timeStamp - items.createItem[i].timeStamp
        );
        return {
          status: SOCKET.FAIL,
          Message: "아이템 생성 간격이 너무 짧습니다.",
        };
      }
    }
  }

  // 다음 스테이지 존재 여부 검사
  nextStageCheck(uuid) {
    try {
      const { stages } = getGameAssets();

      const currentStages = getStage(uuid);

      currentStages.sort((a, b) => a.stage - b.stage);

      const currentStage = currentStages[currentStages.length - 1];

      const nextStage = stages.data.find(
        (stage) => stage.stage === currentStage.stage + 1
      );

      if (!nextStage) {
        return {
          status: SOCKET.FAIL,
          Message: "다음 스테이지가 존재하지 않습니다.",
        };
      }

      return nextStage;
    } catch (error) {
      console.log("다음 스테이지 찾는 중 에러 발생", error);
    }
  }

  // 점수 변조 여부 검사
  scoreCheck(uuid, payload) {
    try {
      const myStages = getStage(uuid);

      const { stages } = getGameAssets();

      let totalscore = 0;

      for (let i = 0; i < myStages.length - 1; i++) {
        const scorePerTime = stages.data.find(
          (stage) => stage.stage === i + 1
        ).scorePerTime;

        totalscore +=
          (myStages[i + 1].timeStamp - myStages[i].timeStamp) * scorePerTime;
      }

      const scorePerTime = stages.data.find(
        (stage) => stage.stage === myStages.length
      ).scorePerTime;

      totalscore +=
        (payload.timeStamp - myStages[myStages.length - 1].timeStamp) *
        scorePerTime;

      let itemScore = 0;

      for (let i = 0; i < getItemSpace(uuid).grabItem.length; i++) {
        itemScore += getItemSpace(uuid).grabItem[i].itemScore;
      }

      if (
        payload.score > (totalscore + itemScore) * 1.01 &&
        totalscore + itemScore > 10
      ) {
        console.log("오차범위 넘는 점수 획득, uuid: ", uuid);
        console.log("서버측 timetotalscore: ", totalscore);
        console.log("서버측 itemtotalscore: ", itemScore);
        console.log("클라이언트 totalscore: ", payload.score);

        return {
          status: SOCKET.FAIL,
          Message: "획득점수가 오차범위를 넘었습니다.",
        };
      }
    } catch (error) {
      console.log("클라이언트점수/서버점수 오차 계산 중 에러 발생", error);
    }
  }

  // 게임 데이터 전달
  loadAssetsFrontEnd(socket) {
    try {
      const assets = getGameAssets();

      socket.emit(SOCKET.LOADASSETS, assets);
    } catch (error) {
      console.log("FrontEnd로 데이터 로드 중 에러 발생", error);
    }
  }

  // 개인/서버 최고기록 경신 여부 체크 및 누적기록 갱신
  checkHighScore = async (io, socket, uuid, score) => {
    try {
      const highScore = await client.get(SOCKET.HIGHSCORE);
      const userData = JSON.parse(await client.get(uuid));

      // 누적 기록 갱신
      await client.set(
        uuid,
        JSON.stringify({
          highScore: userData.highScore,
          totalScore: userData.totalScore + score,
          registrationDate: userData.registrationDate,
        })
      );

      // 서버 최고기록 갱신 시
      if (score > highScore) {
        await client.set(SOCKET.HIGHSCORE, JSON.stringify(score));

        await client.set(
          uuid,
          JSON.stringify({
            highScore: score,
            totalScore: userData.totalScore + score,
            registrationDate: userData.registrationDate,
          })
        );

        io.emit(SOCKET.HIGHSCORE, score);
        socket.emit(SOCKET.USERSCORE, score);

        return {
          status: SOCKET.SUCCESS,
          Message: "게임 종료 서버 최고기록 경신!",
          broadcast: `${uuid}님이 ${score}점을 얻어 서버 기록을 경신하셨습니다!`,
        };

        // 개인 최고기록만 갱신 시
      } else if (score > userData.highScore) {
        await client.set(
          uuid,
          JSON.stringify({
            highScore: score,
            totalScore: userData.totalScore + score,
            registrationDate: userData.registrationDate,
          })
        );

        socket.emit(SOCKET.USERSCORE, score);

        return {
          status: SOCKET.SUCCESS,
          Message: "게임 종료 개인 최고기록 경신!",
          score,
        };
      }
    } catch (error) {
      console.log("기록 경신 여부 검사 및 누적기록 갱신 중 에러 발생", error);
    }
  };

  // 기존 계정 접속 or 새로운 계정 생성
  async setUserUUID(socket) {
    try {
      // 기존계정 찾기
      const keys = await client.keys("*");
      for (let key of keys) {
        if (socket.handshake.headers.cookie === key) {
          const data = await client.get(key);
          socket.emit(SOCKET.RESPONSE, {
            status: SOCKET.SUCCESS,
            message: "기존 계정으로 접속합니다.",
            data,
          });

          return socket.handshake.headers.cookie;
        }
      }

      // 없으면 새계정 생성
      socket.handshake.headers.cookie = uuidv4();
      socket.emit(SOCKET.SETUUID, socket.handshake.headers.cookie);
      await client.set(
        socket.handshake.headers.cookie,
        JSON.stringify({
          highScore: 0,
          totalScore: 0,
          registrationDate: Date.now(),
        })
      );

      const data = await client.get(socket.handshake.headers.cookie);
      socket.emit(SOCKET.RESPONSE, {
        status: SOCKET.SUCCESS,
        message: "새로운 계정을 생성합니다.",
        data,
      });

      return socket.handshake.headers.cookie;
    } catch (error) {
      console.log("계정 설정 중 에러 발생", error);
    }
  }

  // 접속 시 갱신된 서버 최고기록 전달
  async setServerHighScore(socket) {
    const highScore = await client.get(SOCKET.HIGHSCORE);
    socket.emit(SOCKET.HIGHSCORE, highScore);
  }
}

export default new handlerRepository();
