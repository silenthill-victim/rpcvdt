import { React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import { findByProps } from "@vendetta/metro";

const { View } = React;
const { FormSection, FormInput, FormSwitch } = Forms;

const ActivityManager = findByProps("setActivity");

storage.settings ??= {
  details: "Hello world",
  state: "Using Vendetta",

  largeImage: "",
  smallImage: "",

  type: 0,
  timestamp: false,
  enabled: true,

  rotate: true,
  rotateInterval: 10000
};

let interval = null;
let rotateIndex = 0;

const splitLines = (text) =>
  text
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

function buildActivity() {
  const s = storage.settings;

  const detailsList = splitLines(s.details);
  const stateList = splitLines(s.state);

  const details =
    s.rotate && detailsList.length > 1
      ? detailsList[rotateIndex % detailsList.length]
      : detailsList[0];

  const state =
    s.rotate && stateList.length > 1
      ? stateList[rotateIndex % stateList.length]
      : stateList[0];

  const activity = {
    name: "Discord",
    type: Number(s.type),
    details,
    state,
    assets: {}
  };

  if (s.largeImage) activity.assets.large_image = s.largeImage;
  if (s.smallImage) activity.assets.small_image = s.smallImage;

  if (s.timestamp) activity.timestamps = { start: Date.now() };

  return activity;
}

function startRPC() {
  stopRPC();

  if (!storage.settings.enabled) return;

  ActivityManager.setActivity(buildActivity());

  interval = setInterval(() => {
    rotateIndex++;
    ActivityManager.setActivity(buildActivity());
  }, storage.settings.rotate ? storage.settings.rotateInterval : 15000);
}

function stopRPC() {
  if (interval) clearInterval(interval);
  interval = null;
}

export default {
  onLoad() {
    startRPC();
  },

  onUnload() {
    stopRPC();
    ActivityManager.setActivity(null);
  },

  settings: () => {
    const s = storage.settings;

    return (
      <View>
        <FormSection title="Custom RPC">

          <FormSwitch
            label="Enable RPC"
            value={s.enabled}
            onValueChange={(v) => {
              s.enabled = v;
              v ? startRPC() : stopRPC();
            }}
          />

          <FormInput
            title="Details (1 line = 1 text)"
            multiline
            value={s.details}
            onChange={(v) => (s.details = v)}
          />

          <FormInput
            title="State (1 line = 1 text)"
            multiline
            value={s.state}
            onChange={(v) => (s.state = v)}
          />

          <FormInput
            title="Large Image Key"
            value={s.largeImage}
            onChange={(v) => (s.largeImage = v)}
          />

          <FormInput
            title="Small Image Key"
            value={s.smallImage}
            onChange={(v) => (s.smallImage = v)}
          />

          <FormInput
            title="Activity Type (0-4)"
            value={String(s.type)}
            onChange={(v) => (s.type = Number(v))}
          />

          <FormSwitch
            label="Show Timestamp"
            value={s.timestamp}
            onValueChange={(v) => (s.timestamp = v)}
          />

          <FormSwitch
            label="Auto Rotate Text"
            value={s.rotate}
            onValueChange={(v) => {
              s.rotate = v;
              startRPC();
            }}
          />

          <FormInput
            title="Rotate Interval (ms)"
            value={String(s.rotateInterval)}
            onChange={(v) => {
              s.rotateInterval = Number(v) || 10000;
              startRPC();
            }}
          />

        </FormSection>
      </View>
    );
  }
}; 